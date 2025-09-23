const Album = require('../models/Album');

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
