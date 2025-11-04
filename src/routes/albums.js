const express = require('express');
const { getAlbums, getAlbum, getEnhancedAlbum, createAlbum } = require('../controllers/albumController');
const { syncAlbumCover, syncAllAlbumCovers, testDiscogsConnection } = require('../controllers/discogsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rutas básicas de álbumes
router.get('/', getAlbums);
router.get('/:id', getAlbum);
router.get('/:id/enhanced', getEnhancedAlbum);            // Álbum con auto-sync Discogs
router.post('/', protect, createAlbum);

// Rutas Discogs
router.post('/:id/sync-cover', syncAlbumCover);           // Sincronizar portada de un álbum
router.post('/sync-covers', syncAllAlbumCovers);          // Sincronizar todas las portadas
router.get('/discogs/test', testDiscogsConnection);       // Probar conexión Discogs

module.exports = router;