const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    order: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

listSchema.index({ creator: 1, title: 1 });
listSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('List', listSchema);