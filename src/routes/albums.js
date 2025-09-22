const express = require('express');
const {
  getAlbums,
  getAlbum,
  getAlbumReviews,
  searchAlbums
} = require('../controllers/albumController');

const router = express.Router();

router.get('/', getAlbums);
router.get('/search', searchAlbums);
router.get('/:id', getAlbum);
router.get('/:id/reviews', getAlbumReviews);

module.exports = router;