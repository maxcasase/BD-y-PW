const Album = require('../models/Album');
const Review = require('../models/Review');

exports.getAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, year, search } = req.query;
    
    let query = {};
    
    if (genre) query.genre = genre;
    if (year) query.releaseYear = year;
    if (search) {
      query.$text = { $search: search };
    }

    const albums = await Album.find(query)
      .populate('artist', 'name image') 
      .populate('genre', 'name')        
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Album.countDocuments(query);

    res.status(200).json({
      success: true,
      count: albums.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
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
    const album = await Album.findById(req.params.id)
     .populate('artist', 'name bio image genres')  
      .populate('genre', 'name description');      

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
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
    
    const reviews = await Review.find({ album: req.params.id })
      .populate('user', 'username profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ album: req.params.id });

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

exports.searchAlbums = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const albums = await Album.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .populate('artist', 'name')
    .populate('genre', 'name')
    .sort({ score: { $meta: 'textScore' } })
    .limit(10);

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