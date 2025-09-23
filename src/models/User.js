const { query } = require('../config/database');

class User {
  static async create(userData) {
    const result = await query(
      `INSERT INTO users (username, email, password_hash, profile_name) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userData.username, userData.email, userData.password_hash, userData.username]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, username, email, profile_name, bio, avatar_url, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateProfile(userId, profileData) {
    const result = await query(
      `UPDATE users SET profile_name = $1, bio = $2, avatar_url = $3 
       WHERE id = $4 RETURNING *`,
      [profileData.profile_name, profileData.bio, profileData.avatar_url, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;
