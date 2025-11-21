const Album = require('../models/Album');
const discogsService = require('../services/discogsService');

exports.getAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query = { $or: [{ title: regex }, { artistName: regex }] };
    }

    const albums = await Album.find(query)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .exec();

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
    const album = await Album.findById(req.params.id).exec();

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
    const album = await Album.findById(albumId).exec();

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado'
      });
    }

    if (!album.coverImage || album.coverImage.includes('placeholder')) {
      console.log(`🔍 Auto-syncing cover for album ${albumId}: "${album.title}"`);

      try {
        const discogsData = await discogsService.getAlbumCover(album.artistName, album.title);

        if (discogsData) {
          album.coverImage = discogsData.cover_image;
          album.discogsReleaseId = discogsData.discogs_release_id;
          album.discogsData = discogsData.discogs_data;

          await album.save();
          console.log(`✅ Auto-sync successful for album ${albumId}`);
        }
      } catch (error) {
        console.error(`❌ Auto-sync failed for album ${albumId}:`, error.message);
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
    const { title, artistId, releaseYear, genreId, coverImage } = req.body;

    const album = new Album({
      title,
      artistId,
      releaseYear,
      genreId,
      coverImage
    });

    await album.save();

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
