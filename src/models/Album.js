const { query } = require('../config/database');

class Album {
  static async create(albumData) {
    const result = await query(
      `INSERT INTO albums (title, artist_id, release_year, genre_id, cover_image) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [albumData.title, albumData.artist_id, albumData.release_year, albumData.genre_id, albumData.cover_image]
    );
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name 
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async search(queryText, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name 
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.title ILIKE $1 OR ar.name ILIKE $2
       ORDER BY a.created_at DESC
       LIMIT $3 OFFSET $4`,
      [`%${queryText}%`, `%${queryText}%`, limit, offset]
    );
    return result.rows;
  }
}

module.exports = Album;
