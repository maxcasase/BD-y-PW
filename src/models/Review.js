const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  album_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  likes_count: { type: Number, default: 0 },
  dislikes_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
