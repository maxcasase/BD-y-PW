const { pool } = require('../config/database');

class Playlist {
  static async create(playlistData) {
    const [result] = await pool.execute(
      `INSERT INTO playlists (user_id, title, description, is_public) VALUES (?, ?, ?, ?)`,
      [playlistData.user_id, playlistData.title, playlistData.description || '', playlistData.is_public]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username, u.profile_name, u.avatar_url 
       FROM playlists p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [playlists] = await pool.execute(
      `SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return playlists;
  }

  static async findPublicPlaylists(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [playlists] = await pool.execute(
      `SELECT p.*, u.username, u.profile_name 
       FROM playlists p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.is_public = TRUE 
       ORDER BY p.likes_count DESC, p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return playlists;
  }

  static async update(playlistId, playlistData) {
    const [result] = await pool.execute(
      `UPDATE playlists SET title = ?, description = ?, is_public = ? WHERE id = ?`,
      [playlistData.title, playlistData.description, playlistData.is_public, playlistId]
    );
    return result.affectedRows > 0;
  }

  static async delete(playlistId) {
    const [result] = await pool.execute(
      'DELETE FROM playlists WHERE id = ?',
      [playlistId]
    );
    return result.affectedRows > 0;
  }

  static async addAlbumToPlaylist(playlistId, albumId) {
    // Verificar si el álbum ya está en la playlist
    const [existing] = await pool.execute(
      'SELECT id FROM playlist_items WHERE playlist_id = ? AND album_id = ?',
      [playlistId, albumId]
    );

    if (existing.length > 0) {
      return 'ALREADY_IN_PLAYLIST';
    }

    // Obtener el máximo order actual
    const [[maxOrder]] = await pool.execute(
      `SELECT COALESCE(MAX(track_order), 0) as max_order 
       FROM playlist_items WHERE playlist_id = ?`,
      [playlistId]
    );

    const [result] = await pool.execute(
      `INSERT INTO playlist_items (playlist_id, album_id, track_order) VALUES (?, ?, ?)`,
      [playlistId, albumId, maxOrder.max_order + 1]
    );
    return result.insertId;
  }

  static async removeAlbumFromPlaylist(playlistId, albumId) {
    const [result] = await pool.execute(
      'DELETE FROM playlist_items WHERE playlist_id = ? AND album_id = ?',
      [playlistId, albumId]
    );

    // Reordenar los tracks restantes
    if (result.affectedRows > 0) {
      await this.reorderPlaylistItems(playlistId);
    }

    return result.affectedRows > 0;
  }

  static async getPlaylistItems(playlistId) {
    const [items] = await pool.execute(
      `SELECT pi.*, a.title as album_title, a.cover_image, a.release_year,
              ar.name as artist_name, a.duration
       FROM playlist_items pi
       LEFT JOIN albums a ON pi.album_id = a.id
       LEFT JOIN artists ar ON a.artist_id = ar.id
       WHERE pi.playlist_id = ?
       ORDER BY pi.track_order`,
      [playlistId]
    );
    return items;
  }

  static async reorderPlaylistItems(playlistId) {
    const [items] = await pool.execute(
      'SELECT id FROM playlist_items WHERE playlist_id = ? ORDER BY track_order',
      [playlistId]
    );

    for (let i = 0; i < items.length; i++) {
      await pool.execute(
        'UPDATE playlist_items SET track_order = ? WHERE id = ?',
        [i + 1, items[i].id]
      );
    }
  }

  static async likePlaylist(playlistId, userId) {
    // Verificar si ya dio like (implementar tabla de likes si es necesario)
    const [result] = await pool.execute(
      `UPDATE playlists SET likes_count = likes_count + 1 WHERE id = ?`,
      [playlistId]
    );
    return result.affectedRows > 0;
  }

  static async searchPlaylists(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [playlists] = await pool.execute(
      `SELECT p.*, u.username, u.profile_name 
       FROM playlists p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE (p.title LIKE ? OR p.description LIKE ?) AND p.is_public = TRUE
       ORDER BY p.likes_count DESC 
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    return playlists;
  }

  static async getPlaylistStats(playlistId) {
    const [[itemsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM playlist_items WHERE playlist_id = ?',
      [playlistId]
    );

    const [[totalDuration]] = await pool.execute(
      `SELECT COALESCE(SUM(a.duration), 0) as total_duration 
       FROM playlist_items pi
       LEFT JOIN albums a ON pi.album_id = a.id
       WHERE pi.playlist_id = ?`,
      [playlistId]
    );

    return {
      items_count: itemsCount.count,
      total_duration: totalDuration.total_duration
    };
  }
}

module.exports = Playlist;