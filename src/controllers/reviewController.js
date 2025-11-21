const mongoose = require('mongoose');
const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    let { album_id, rating, title, content } = req.body;
    const user_id = req.user.id.toString(); // forzamos a string

    // Validar album_id como ObjectId
    if (!mongoose.Types.ObjectId.isValid(album_id)) {
      return res.status(400).json({
        success: false,
        message: 'album_id inválido para MongoDB',
      });
    }
    album_id = new mongoose.Types.ObjectId(album_id);

    // Revisar si ya existe la reseña
    const existingReview = await Review.findOne({ user_id, album_id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reseñado este álbum'
      });
    }

    const review = new Review({ user_id, album_id, rating, title, content });
    await review.save();

    res.status(201).json({
      success: true,
      review: review.toObject()
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, album_id } = req.query;
    const filter = album_id ? { album_id } : {};

    const reviews = await Review.find(filter)
      .sort({ created_at: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('user_id', 'username profile_name avatar_url')
      .exec();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    const reviews = await Review.find({ user_id })
      .sort({ created_at: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('album_id')
      .exec();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const user_id = req.user.id;

    // Solo permite borrar si la review es del usuario autenticado
    const review = await Review.findOne({ _id: reviewId, user_id });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada o no tienes permisos'
      });
    }

    await Review.deleteOne({ _id: reviewId });
    res.status(200).json({
      success: true,
      message: 'Review eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
