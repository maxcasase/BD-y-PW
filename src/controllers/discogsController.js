const { query } = require('../config/database');
const discogsService = require('../services/discogsService');

exports.syncAlbumCover = async (req, res) => {
  try {
    const albumId = req.params.id;

    // Obtener datos del álbum desde BD
    const albumResult = await query(
      `SELECT a.id, a.title, ar.name as artist_name, a.cover_image, a.discogs_release_id
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       WHERE a.id = $1`,
      [albumId]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    const album = albumResult.rows[0];

    // Si ya tiene cover_image válida y discogs_release_id, no hacer nada a menos que sea forzado
    const force = req.query.force === 'true';
    if (!force && album.cover_image && album.discogs_release_id && 
        album.cover_image !== '' && 
        !album.cover_image.includes('placeholder')) {
      return res.json({
        success: true,
        message: 'El álbum ya tiene portada válida',
        cover_image: album.cover_image,
        cached: true
      });
    }

    console.log(`🔄 Syncing cover for "${album.title}" by "${album.artist_name}"`);

    // Buscar en Discogs
    const discogsData = await discogsService.getAlbumCover(album.artist_name, album.title);

    if (!discogsData) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró información en Discogs para este álbum'
      });
    }

    // Actualizar en BD
    await query(
      `UPDATE albums 
       SET cover_image = $1, discogs_release_id = $2
       WHERE id = $3`,
      [discogsData.cover_image, discogsData.discogs_release_id, albumId]
    );

    console.log(`✅ Cover updated for album ID ${albumId}`);

    res.json({
      success: true,
      message: 'Portada actualizada exitosamente',
      cover_image: discogsData.cover_image,
      discogs_release_id: discogsData.discogs_release_id,
      discogs_data: discogsData.discogs_data
    });

  } catch (error) {
    console.error('Error syncing album cover:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.syncAllAlbumCovers = async (req, res) => {
  try {
    console.log('🔄 Starting bulk album cover sync...');

    // Obtener todos los álbumes
    const albumsResult = await query(
      `SELECT a.id, a.title, ar.name as artist_name, a.cover_image
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       ORDER BY a.id`
    );

    const results = [];
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const album of albumsResult.rows) {
      try {
        // Skip si ya tiene cover válida
        if (album.cover_image && !album.cover_image.includes('placeholder')) {
          results.push({ 
            id: album.id, 
            title: album.title, 
            status: 'skipped', 
            message: 'Ya tiene portada válida' 
          });
          skipped++;
          continue;
        }

        console.log(`🔍 Processing: "${album.title}" by "${album.artist_name}"`);
        
        const discogsData = await discogsService.getAlbumCover(album.artist_name, album.title);
        
        if (discogsData) {
          await query(
            `UPDATE albums 
             SET cover_image = $1, discogs_release_id = $2
             WHERE id = $3`,
            [discogsData.cover_image, discogsData.discogs_release_id, album.id]
          );
          
          results.push({ 
            id: album.id, 
            title: album.title, 
            status: 'updated', 
            cover_image: discogsData.cover_image 
          });
          updated++;
        } else {
          results.push({ 
            id: album.id, 
            title: album.title, 
            status: 'not_found', 
            message: 'No encontrado en Discogs' 
          });
          errors++;
        }

        // Rate limiting: pausa entre llamadas
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Error processing album ${album.id}:`, error.message);
        results.push({ 
          id: album.id, 
          title: album.title, 
          status: 'error', 
          message: error.message 
        });
        errors++;
      }
    }

    console.log(`✅ Bulk sync completed: ${updated} updated, ${skipped} skipped, ${errors} errors`);

    res.json({
      success: true,
      message: `Sync completado: ${updated} actualizados, ${skipped} omitidos, ${errors} errores`,
      summary: { updated, skipped, errors },
      results
    });

  } catch (error) {
    console.error('Error in bulk album cover sync:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.testDiscogsConnection = async (req, res) => {
  try {
    const connectionOk = await discogsService.testConnection();
    
    res.json({
      success: connectionOk,
      message: connectionOk ? 'Discogs API connection successful' : 'Discogs API connection failed',
      token_configured: !!discogsService.token
    });
  } catch (error) {
    console.error('Error testing Discogs connection:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};