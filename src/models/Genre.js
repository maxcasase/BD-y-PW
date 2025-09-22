const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  subgenres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subgenre'
  }],
  totalAlbums: {
    type: Number,
    default: 0
  },
  totalArtists: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Genre', genreSchema);