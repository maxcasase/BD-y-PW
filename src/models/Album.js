const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  releaseYear: Number,
  genreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
  coverImage: String,
  discogsReleaseId: Number,
  totalTracks: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
