const express = require('express');
const { 
  createPlaylist, 
  getPlaylists, 
  getPlaylist, 
  addToPlaylist, 
  likePlaylist 
} = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');
const { validatePlaylist } = require('../middleware/validation');

const router = express.Router();

router.get('/', getPlaylists);
router.get('/:id', getPlaylist);
router.post('/', protect, validatePlaylist, createPlaylist);
router.post('/:id/add', protect, addToPlaylist);
router.post('/:id/like', protect, likePlaylist);

module.exports = router;