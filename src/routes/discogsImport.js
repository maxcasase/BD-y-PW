const express = require('express');
const discogsService = require('../services/discogsService');
const { query } = require('../config/database');

const router = express.Router();

// Buscar álbumes en Discogs
router.get('/search', async (req, res) => {
  const { artist, title } = req.query;
  if (!artist || !title) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros artist y title' });
  }
  try {
    const results = await discogsService.searchAlbums(artist, title);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Guardar un álbum encontrado en Discogs en tu BD
router.post('/save', async (req, res) => {
  try {
    const { title, artist, year, cover_image, discogs_release_id } = req.body;
    if (!title || !artist || !discogs_release_id) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros obligatorios (title, artist, discogs_release_id)' });
    }
    // Buscar artista existente o crearlo
    let artistResult = await query('SELECT id FROM artists WHERE name = $1', [artist]);
    let artistId;
    if (artistResult.rows.length > 0) {
      artistId = artistResult.rows[0].id;
    } else {
      const insArt = await query('INSERT INTO artists (name) VALUES ($1) RETURNING id', [artist]);
      artistId = insArt.rows[0].id;
    }
    // Crear álbum
    const insAlbum = await query(`INSERT INTO albums (title, artist_id, year, cover_image, discogs_release_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [title, artistId, year, cover_image, discogs_release_id]);
    res.json({ success: true, albumId: insAlbum.rows[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
