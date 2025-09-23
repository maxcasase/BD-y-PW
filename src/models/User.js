const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, profile_name, bio, avatar_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.username,
        userData.email,
        userData.password_hash,
        userData.profile_name || userData.username,
        userData.bio || '',
        userData.avatar_url || ''
      ]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, profile_name, bio, avatar_url, created_at 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async updateProfile(userId, profileData) {
    const [result] = await pool.execute(
      `UPDATE users SET profile_name = ?, bio = ?, avatar_url = ? 
       WHERE id = ?`,
      [
        profileData.profile_name,
        profileData.bio,
        profileData.avatar_url,
        userId
      ]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, userId]
    );
    return result.affectedRows > 0;
  }

  static async followUser(followerId, followingId) {
    if (followerId === followingId) {
      return 'SELF_FOLLOW';
    }

    // Verificar si ya sigue al usuario
    const [existing] = await pool.execute(
      'SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return 'ALREADY_FOLLOWING';
    }

    await pool.execute(
      'INSERT INTO user_followers (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    return 'FOLLOWED';
  }

  static async unfollowUser(followerId, followingId) {
    const [result] = await pool.execute(
      'DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return result.affectedRows > 0;
  }

  static async getFollowers(userId) {
    const [followers] = await pool.execute(
      `SELECT u.id, u.username, u.profile_name, u.avatar_url 
       FROM user_followers uf 
       JOIN users u ON uf.follower_id = u.id 
       WHERE uf.following_id = ?`,
      [userId]
    );
    return followers;
  }

  static async getFollowing(userId) {
    const [following] = await pool.execute(
      `SELECT u.id, u.username, u.profile_name, u.avatar_url 
       FROM user_followers uf 
       JOIN users u ON uf.following_id = u.id 
       WHERE uf.follower_id = ?`,
      [userId]
    );
    return following;
  }

  static async getUserStats(userId) {
    const [[reviewsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );

    const [[followersCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_followers WHERE following_id = ?',
      [userId]
    );

    const [[followingCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_followers WHERE follower_id = ?',
      [userId]
    );

    const [[playlistsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM playlists WHERE user_id = ?',
      [userId]
    );

    return {
      reviews_count: reviewsCount.count,
      followers_count: followersCount.count,
      following_count: followingCount.count,
      playlists_count: playlistsCount.count
    };
  }

  static async searchUsers(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [users] = await pool.execute(
      `SELECT id, username, profile_name, avatar_url, created_at 
       FROM users 
       WHERE username LIKE ? OR profile_name LIKE ? 
       ORDER BY username 
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    return users;
  }

  static async deleteUser(userId) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;