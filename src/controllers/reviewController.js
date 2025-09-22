const Review = require('../models/Review');
const Album = require('../models/Album');

exports.createReview = async (req, res) => {
  try {
    const { albumId, rating, title, content } = req.body;

    // Check if user already reviewed this album
    const existingReview = await Review.findOne({
      user: req.user.id,
      album: albumId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this album'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      album: albumId,
      rating,
      title,
      content
    });

    // Update album rating stats
    await updateAlbumRating(albumId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username profile');

    res.status(201).json({
      success: true,
      review: populatedReview
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
    
    let query = {};
    if (album) query.album = album;
    if (user) query.user = user;

    const reviews = await Review.find(query)
      .populate('user', 'username profile')
      .populate('album', 'title artist')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
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
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('user', 'username profile');

    // Update album rating if rating changed
    if (req.body.rating) {
      await updateAlbumRating(review.album);
    }

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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const albumId = review.album;
    await Review.findByIdAndDelete(req.params.id);

    // Update album rating stats
    await updateAlbumRating(albumId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update album rating
const updateAlbumRating = async (albumId) => {
  const stats = await Review.aggregate([
    { $match: { album: albumId } },
    {
      $group: {
        _id: '$album',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Album.findByIdAndUpdate(albumId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings
    });
  } else {
    await Album.findByIdAndUpdate(albumId, {
      averageRating: 0,
      totalRatings: 0
    });
  }
};