const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  image: {
    type: String,
    default: ''
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  activeYears: {
    start: Number,
    end: Number
  },
  totalAlbums: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

artistSchema.index({ name: 'text' });

module.exports = mongoose.model('Artist', artistSchema);