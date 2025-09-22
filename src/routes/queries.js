const express = require('express');
const queries = require('../utils/queries');

const router = express.Router();

// Ruta para probar todas las consultas
router.get('/test-queries', async (req, res) => {
  try {
    const results = {};

    // Ejecutar todas las consultas
    results.allAlbums = await queries.getAllAlbums();
    results.albumsByGenre = await queries.getAlbumsByGenre(req.query.genreId);
    results.albumsByYear = await queries.getAlbumsByYear(1973);
    results.searchResults = await queries.searchAlbums(req.query.search || 'dark');
    results.topRated = await queries.getTopRatedAlbums();
    results.artistsWithAlbums = await queries.getArtistsWithAlbums();
    
    if (req.query.albumId) {
      results.albumReviews = await queries.getAlbumReviews(req.query.albumId);
    }
    
    results.topReviewers = await queries.getTopReviewers();
    results.genreStats = await queries.getGenreStats();
    results.popularLists = await queries.getPopularPublicLists();

    res.status(200).json({
      success: true,
      message: 'Todas las consultas ejecutadas correctamente',
      results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ejecutando consultas',
      error: error.message
    });
  }
});

// Rutas individuales para cada consulta
router.get('/albums', async (req, res) => {
  try {
    const albums = await queries.getAllAlbums();
    res.json({ success: true, count: albums.length, albums });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/albums/genre/:genreId', async (req, res) => {
  try {
    const albums = await queries.getAlbumsByGenre(req.params.genreId);
    res.json({ success: true, count: albums.length, albums });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats/genres', async (req, res) => {
  try {
    const stats = await queries.getGenreStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agrega más rutas para las otras consultas...

module.exports = router;