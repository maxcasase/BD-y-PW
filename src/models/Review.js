const { pool } = require('../config/database');

class Review {
  static async create(reviewData) {
    const [result] = await pool.execute(
      `INSERT INTO reviews (user_id, album_id, rating, title, content) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        reviewData.user_id,
        reviewData.album_id,
        reviewData.rating,
        reviewData.title,
        reviewData.content
      ]
    );
    
    await this.updateAlbumRating(reviewData.album_id);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT r.*, u.username, u.profile_name, u.avatar_url, a.title as album_title 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN albums a ON r.album_id = a.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserAndAlbum(userId, albumId) {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND album_id = ?',
      [userId, albumId]
    );
    return rows[0];
  }

  static async findByAlbumId(albumId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.profile_name, u.avatar_url 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.album_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [albumId, limit, offset]
    );
    
    return reviews;
  }

  static async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [reviews] = await pool.execute(
      `SELECT r.*, a.title as album_title, a.cover_image, ar.name as artist_name
       FROM reviews r
       LEFT JOIN albums a ON r.album_id = a.id
       LEFT JOIN artists ar ON a.artist_id = ar.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    return reviews;
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.profile_name, u.avatar_url, a.title as album_title 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN albums a ON r.album_id = a.id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    return reviews;
  }

  static async update(reviewId, reviewData) {
    const [result] = await pool.execute(
      `UPDATE reviews SET rating = ?, title = ?, content = ? 
       WHERE id = ?`,
      [
        reviewData.rating,
        reviewData.title,
        reviewData.content,
        reviewId
      ]
    );
    
    if (result.affectedRows > 0) {
      const [rows] = await pool.execute(
        'SELECT album_id FROM reviews WHERE id = ?',
        [reviewId]
      );
      if (rows[0]) {
        await this.updateAlbumRating(rows[0].album_id);
      }
    }
    
    return result.affectedRows > 0;
  }

  static async delete(reviewId) {
    const [rows] = await pool.execute(
      'SELECT album_id FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    const [result] = await pool.execute(
      'DELETE FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    if (result.affectedRows > 0 && rows[0]) {
      await this.updateAlbumRating(rows[0].album_id);
    }
    
    return result.affectedRows > 0;
  }

  static async getRecentReviews(limit = 10) {
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.profile_name, u.avatar_url, 
              a.title as album_title, a.cover_image, ar.name as artist_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN albums a ON r.album_id = a.id
       LEFT JOIN artists ar ON a.artist_id = ar.id
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return reviews;
  }

  static async getTopReviewers(limit = 10) {
    const [reviewers] = await pool.execute(
      `SELECT u.id, u.username, u.profile_name, u.avatar_url,
              COUNT(r.id) as reviews_count,
              AVG(r.rating) as avg_rating
       FROM users u
       LEFT JOIN reviews r ON u.id = r.user_id
       GROUP BY u.id
       HAVING reviews_count > 0
       ORDER BY reviews_count DESC, avg_rating DESC
       LIMIT ?`,
      [limit]
    );
    return reviewers;
  }

  static async updateAlbumRating(albumId) {
    await pool.execute(
      `UPDATE albums 
       SET average_rating = (
         SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE album_id = ?
       ), total_ratings = (
         SELECT COUNT(*) FROM reviews WHERE album_id = ?
       )
       WHERE id = ?`,
      [albumId, albumId, albumId]
    );
  }

  static async likeReview(reviewId) {
    const [result] = await pool.execute(
      'UPDATE reviews SET likes_count = likes_count + 1 WHERE id = ?',
      [reviewId]
    );
    return result.affectedRows > 0;
  }

  static async dislikeReview(reviewId) {
    const [result] = await pool.execute(
      'UPDATE reviews SET dislikes_count = dislikes_count + 1 WHERE id = ?',
      [reviewId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Review;