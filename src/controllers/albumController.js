const Album = require('../models/Album');
const discogsService = require('../services/discogsService');
const { query } = require('../config/database');

exports.getAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let albums;
    if (search) {
      albums = await Album.search(search, parseInt(page), parseInt(limit));
    } else {
      albums = await Album.findAll(parseInt(page), parseInt(limit));
    }

    res.status(200).json({
      success: true,
      count: albums.length,
      albums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEnhancedAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await Album.findById(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    // Si no tiene portada válida, intentar obtenerla de Discogs
    if (!album.cover_image || album.cover_image.includes('placeholder')) {
      console.log(`🔍 Auto-syncing cover for album ${albumId}: "${album.title}"`);
      
      try {
        const discogsData = await discogsService.getAlbumCover(album.artist_name, album.title);
        
        if (discogsData) {
          // Actualizar en BD
          await query(
            `UPDATE albums 
             SET cover_image = $1, discogs_release_id = $2
             WHERE id = $3`,
            [discogsData.cover_image, discogsData.discogs_release_id, albumId]
          );
          
          // Actualizar objeto album
          album.cover_image = discogsData.cover_image;
          album.discogs_release_id = discogsData.discogs_release_id;
          album.discogs_data = discogsData.discogs_data;
          
          console.log(`✅ Auto-sync successful for album ${albumId}`);
        }
      } catch (error) {
        console.error(`❌ Auto-sync failed for album ${albumId}:`, error.message);
        // Continuar con los datos existentes si falla
      }
    }

    res.status(200).json({
      success: true,
      album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const { title, artist_id, release_year, genre_id, cover_image } = req.body;
    
    const album = await Album.create({
      title,
      artist_id,
      release_year,
      genre_id,
      cover_image
    });

    res.status(201).json({
      success: true,
      album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};