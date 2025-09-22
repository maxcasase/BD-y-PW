const express = require('express');
const {
  searchExternalAlbums,
  getExternalAlbumDetails,
  searchExternalArtists,
  getNewReleases,
  getTopByGenre
} = require('../controllers/externalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search/albums', protect, searchExternalAlbums);
router.get('/albums/:albumId', protect, getExternalAlbumDetails);
router.get('/search/artists', protect, searchExternalArtists);
router.get('/new-releases', protect, getNewReleases);
router.get('/top-by-genre', protect, getTopByGenre);

module.exports = router;