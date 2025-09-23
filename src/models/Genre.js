const { pool } = require('../config/database');

class Genre {
  static async create(genreData) {
    const [result] = await pool.execute(
      `INSERT INTO genres (name, description) VALUES (?, ?)`,
      [genreData.name, genreData.description || '']
    );
    return result.insertId;
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [genres] = await pool.execute(
      `SELECT * FROM genres ORDER BY name LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return genres;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM genres WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute(
      `SELECT * FROM genres WHERE name = ?`,
      [name]
    );
    return rows[0];
  }

  static async update(genreId, genreData) {
    const [result] = await pool.execute(
      `UPDATE genres SET name = ?, description = ? WHERE id = ?`,
      [genreData.name, genreData.description, genreId]
    );
    return result.affectedRows > 0;
  }

  static async getGenreAlbums(genreId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [albums] = await pool.execute(
      `SELECT a.*, ar.name as artist_name 
       FROM albums a 
       LEFT JOIN artists ar ON a.artist_id = ar.id 
       WHERE a.genre_id = ? 
       ORDER BY a.average_rating DESC, a.release_year DESC
       LIMIT ? OFFSET ?`,
      [genreId, limit, offset]
    );
    return albums;
  }

  static async getGenreStats(genreId) {
    const [[albumsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM albums WHERE genre_id = ?',
      [genreId]
    );

    const [[artistsCount]] = await pool.execute(
      `SELECT COUNT(DISTINCT artist_id) as count 
       FROM albums WHERE genre_id = ?`,
      [genreId]
    );

    const [[averageRating]] = await pool.execute(
      `SELECT COALESCE(AVG(average_rating), 0) as avg_rating 
       FROM albums WHERE genre_id = ? AND average_rating > 0`,
      [genreId]
    );

    return {
      albums_count: albumsCount.count,
      artists_count: artistsCount.count,
      average_rating: parseFloat(averageRating.avg_rating)
    };
  }

  static async getPopularGenres(limit = 10) {
    const [genres] = await pool.execute(
      `SELECT g.*, COUNT(a.id) as albums_count
       FROM genres g
       LEFT JOIN albums a ON g.id = a.genre_id
       GROUP BY g.id
       HAVING albums_count > 0
       ORDER BY albums_count DESC
       LIMIT ?`,
      [limit]
    );
    return genres;
  }

  static async search(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [genres] = await pool.execute(
      `SELECT * FROM genres WHERE name LIKE ? ORDER BY name LIMIT ? OFFSET ?`,
      [`%${query}%`, limit, offset]
    );
    return genres;
  }

  static async deleteGenre(genreId) {
    const [result] = await pool.execute(
      'DELETE FROM genres WHERE id = ?',
      [genreId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Genre;