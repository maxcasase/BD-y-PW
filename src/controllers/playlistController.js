const Playlist = require('../models/Playlist');

exports.createPlaylist = async (req, res) => {
  try {
    const { title, description, is_public } = req.body;
    
    const playlistId = await Playlist.create({
      user_id: req.user.id,
      title,
      description: description || '',
      is_public: is_public !== undefined ? is_public : true
    });

    const playlist = await Playlist.findById(playlistId);

    res.status(201).json({
      success: true,
      playlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 10, user } = req.query;
    
    let playlists;
    if (user) {
      playlists = await Playlist.findByUserId(user, parseInt(page), parseInt(limit));
    } else {
      playlists = await Playlist.findPublicPlaylists(parseInt(page), parseInt(limit));
    }

    res.status(200).json({
      success: true,
      count: playlists.length,
      playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist no encontrada'
      });
    }

    // Obtener items de la playlist
    const items = await Playlist.getPlaylistItems(req.params.id);

    res.status(200).json({
      success: true,
      playlist: {
        ...playlist,
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addToPlaylist = async (req, res) => {
  try {
    const { album_id } = req.body;
    
    const itemId = await Playlist.addAlbumToPlaylist(req.params.id, album_id);

    res.status(201).json({
      success: true,
      message: 'Álbum agregado a la playlist',
      item_id: itemId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.likePlaylist = async (req, res) => {
  try {
    const liked = await Playlist.likePlaylist(req.params.id, req.user.id);

    if (!liked) {
      return res.status(404).json({
        success: false,
        message: 'Playlist no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Playlist liked correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};