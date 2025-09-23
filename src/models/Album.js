const { pool } = require('../config/database');

class Album {
  static async create(albumData) {
    const [result] = await pool.execute(
      `INSERT INTO albums (title, artist_id, release_year, genre_id, cover_image, total_tracks, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        albumData.title,
        albumData.artist_id,
        albumData.release_year,
        albumData.genre_id,
        albumData.cover_image || '',
        albumData.total_tracks || 0,
        albumData.duration || 0
      ]
    );
    return result.insertId;
  }

  static async findAll(page = 1, limit = 10, genreId = null, year = null, artistId = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT a.*, ar.name as artist_name, g.name as genre_name 
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN genres g ON a.genre_id = g.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (genreId) {
      conditions.push('a.genre_id = ?');
      params.push(genreId);
    }
    
    if (year) {
      conditions.push('a.release_year = ?');
      params.push(year);
    }

    if (artistId) {
      conditions.push('a.artist_id = ?');
      params.push(artistId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [albums] = await pool.execute(query, params);
    return albums;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, ar.name as artist_name, ar.bio as artist_bio, ar.image_url as artist_image,
              g.name as genre_name, g.description as genre_description
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTitle(title) {
    const [rows] = await pool.execute(
      'SELECT * FROM albums WHERE title = ?',
      [title]
    );
    return rows[0];
  }

  static async update(albumId, albumData) {
    const [result] = await pool.execute(
      `UPDATE albums SET title = ?, artist_id = ?, release_year = ?, genre_id = ?, 
       cover_image = ?, total_tracks = ?, duration = ? 
       WHERE id = ?`,
      [
        albumData.title,
        albumData.artist_id,
        albumData.release_year,
        albumData.genre_id,
        albumData.cover_image,
        albumData.total_tracks,
        albumData.duration,
        albumId
      ]
    );
    return result.affectedRows > 0;
  }

  static async search(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [albums] = await pool.execute(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name 
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.title LIKE ? OR ar.name LIKE ?
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    
    return albums;
  }

  static async getTopRated(limit = 10) {
    const [albums] = await pool.execute(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name 
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.average_rating > 0
       ORDER BY a.average_rating DESC, a.total_ratings DESC
       LIMIT ?`,
      [limit]
    );
    return albums;
  }

  static async getNewReleases(limit = 10) {
    const currentYear = new Date().getFullYear();
    
    const [albums] = await pool.execute(
      `SELECT a.*, ar.name as artist_name, g.name as genre_name 
       FROM albums a
       LEFT JOIN artists ar ON a.artist_id = ar.id
       LEFT JOIN genres g ON a.genre_id = g.id
       WHERE a.release_year >= ? - 2
       ORDER BY a.release_year DESC, a.created_at DESC
       LIMIT ?`,
      [currentYear, limit]
    );
    return albums;
  }

  static async getAlbumsByGenre(genreId, page = 1, limit = 10) {
    return this.findAll(page, limit, genreId);
  }

  static async getAlbumsByArtist(artistId, page = 1, limit = 10) {
    return this.findAll(page, limit, null, null, artistId);
  }

  static async getAlbumStats(albumId) {
    const [[reviewsCount]] = await pool.execute(
      'SELECT COUNT(*) as count FROM reviews WHERE album_id = ?',
      [albumId]
    );

    const [[averageRating]] = await pool.execute(
      'SELECT COALESCE(AVG(rating), 0) as avg_rating FROM reviews WHERE album_id = ?',
      [albumId]
    );

    return {
      reviews_count: reviewsCount.count,
      average_rating: parseFloat(averageRating.avg_rating)
    };
  }

  static async updateRating(albumId) {
    await pool.execute(
      `UPDATE albums a
       SET average_rating = (
         SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE album_id = ?
       ), total_ratings = (
         SELECT COUNT(*) FROM reviews WHERE album_id = ?
       )
       WHERE a.id = ?`,
      [albumId, albumId, albumId]
    );
  }

  static async deleteAlbum(albumId) {
    const [result] = await pool.execute(
      'DELETE FROM albums WHERE id = ?',
      [albumId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Album;