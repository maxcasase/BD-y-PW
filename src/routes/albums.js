const express = require('express');
const { getAlbums, getAlbum, createAlbum } = require('../controllers/albumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAlbums);
router.get('/:id', getAlbum);
router.post('/', protect, createAlbum);

module.exports = router;
