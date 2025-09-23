const Album = require('../models/Album');
const Review = require('../models/Review');

exports.getAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, year, search } = req.query;
    
    let albums;
    if (search) {
      albums = await Album.search(search, parseInt(page), parseInt(limit));
    } else {
      albums = await Album.findAll(parseInt(page), parseInt(limit), genre, year);
    }

    // Obtener total para paginación (simplificado)
    const total = albums.length; // En producción, harías un COUNT separado

    res.status(200).json({
      success: true,
      count: albums.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
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

exports.getAlbumReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.findByAlbumId(req.params.id, parseInt(page), parseInt(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
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
    const { title, artist_id, release_year, genre_id, cover_image, total_tracks, duration } = req.body;
    
    const albumId = await Album.create({
      title,
      artist_id,
      release_year,
      genre_id,
      cover_image,
      total_tracks,
      duration
    });

    const album = await Album.findById(albumId);

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