const { pool } = require('../config/database');

class Artist {
  static async create(artistData) {
    const [result] = await pool.execute(
      `INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)`,
      [artistData.name, artistData.bio || '', artistData.image_url || '']
    );
    return result.insertId;
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [artists] = await pool.execute(
      `SELECT * FROM artists ORDER BY name LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return artists;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM artists WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute(
      `SELECT * FROM artists WHERE name = ?`,
      [name]
    );
    return rows[0];
  }

  static async update(artistId, artistData) {
    const [result] = await pool.execute(
      `UPDATE artists SET name = ?, bio = ?, image_url = ? WHERE id = ?`,
      [artistData.name, artistData.bio, artistData.image_url, artistId]
    );
    return result.affectedRows > 0;
  }

  static async search(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [artists] = await pool.execute(
      `SELECT * FROM artists WHERE name LIKE ? ORDER BY name LIMIT ? OFFSET ?`,
      [`%${query}%`, limit, offset]
    );
    return artists;
  }

  static async getArtistAlbums(artistId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [albums] = await pool.execute(
      `SELECT a.*, g.name as genre_name 
       FROM albums a 
       LEFT JOIN genres g ON a.genre_id = g.id 
       WHERE a.artist_id = ? 
       ORDER BY a.release_year DESC 
       LIMIT ? OFFSET ?`,
      [artistId, limit, offset]
    );
    return albums;
  }

  static async getArtistStats(artistId) {
    const [[albumsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM albums WHERE artist_id = ?',
      [artistId]
    );

    const [[averageRating]] = await pool.execute(
      `SELECT COALESCE(AVG(a.average_rating), 0) as avg_rating 
       FROM albums a WHERE a.artist_id = ?`,
      [artistId]
    );

    const [[totalRatings]] = await pool.execute(
      `SELECT COALESCE(SUM(a.total_ratings), 0) as total_ratings 
       FROM albums a WHERE a.artist_id = ?`,
      [artistId]
    );

    return {
      albums_count: albumsCount.count,
      average_rating: parseFloat(averageRating.avg_rating),
      total_ratings: totalRatings.total_ratings
    };
  }

  static async getTopArtists(limit = 10) {
    const [artists] = await pool.execute(
      `SELECT a.*, 
              COUNT(al.id) as albums_count,
              AVG(al.average_rating) as avg_rating
       FROM artists a
       LEFT JOIN albums al ON a.id = al.artist_id
       GROUP BY a.id
       HAVING albums_count > 0
       ORDER BY avg_rating DESC, albums_count DESC
       LIMIT ?`,
      [limit]
    );
    return artists;
  }

  static async deleteArtist(artistId) {
    const [result] = await pool.execute(
      'DELETE FROM artists WHERE id = ?',
      [artistId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Artist;