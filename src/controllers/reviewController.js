const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { album_id, rating, title, content } = req.body;
    
    // Verificar si ya existe reseña del usuario para este álbum
    const existingReview = await Review.findByUserAndAlbum(req.user.id, album_id);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reseñado este álbum'
      });
    }

    const reviewId = await Review.create({
      user_id: req.user.id,
      album_id,
      rating,
      title,
      content
    });

    // Obtener review completa con datos de usuario
    const review = await Review.findById(reviewId);

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, album, user } = req.query;
    
    let reviews;
    if (album) {
      reviews = await Review.findByAlbumId(album, parseInt(page), parseInt(limit));
    } else if (user) {
      reviews = await Review.findByUserId(user, parseInt(page), parseInt(limit));
    } else {
      // Todas las reseñas (con paginación)
      reviews = await Review.findAll(parseInt(page), parseInt(limit));
    }

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

exports.updateReview = async (req, res) => {
  try {
    const { rating, title, content } = req.body;
    
    const updated = await Review.update(req.params.id, {
      rating,
      title,
      content
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    const review = await Review.findById(req.params.id);

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};