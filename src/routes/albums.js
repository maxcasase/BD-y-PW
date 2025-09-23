const express = require('express');
const { 
  getAlbums, 
  getAlbum, 
  getAlbumReviews, 
  createAlbum 
} = require('../controllers/albumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAlbums);
router.get('/:id', getAlbum);
router.get('/:id/reviews', getAlbumReviews);
router.post('/', protect, createAlbum); // Solo usuarios autenticados

module.exports = router;