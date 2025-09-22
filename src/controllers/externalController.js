const musicAPIClient = require('../utils/apiClient');

exports.searchExternalAlbums = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await musicAPIClient.searchAlbums(q, parseInt(limit));

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExternalAlbumDetails = async (req, res) => {
  try {
    const { albumId } = req.params;

    const albumDetails = await musicAPIClient.getAlbumDetails(albumId);

    res.status(200).json({
      success: true,
      album: albumDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchExternalArtists = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await musicAPIClient.searchArtists(q, parseInt(limit));

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getNewReleases = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const newReleases = await musicAPIClient.getNewReleases(parseInt(limit));

    res.status(200).json({
      success: true,
      count: newReleases.length,
      releases: newReleases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTopByGenre = async (req, res) => {
  try {
    const { genre, limit = 20 } = req.query;

    if (!genre) {
      return res.status(400).json({
        success: false,
        message: 'Genre is required'
      });
    }

    const topAlbums = await musicAPIClient.getTopAlbumsByGenre(genre, parseInt(limit));

    res.status(200).json({
      success: true,
      count: topAlbums.length,
      genre,
      albums: topAlbums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};