const Review = require('../models/Review');
const { query } = require('../config/database');

exports.createReview = async (req, res) => {
  try {
    const { album_id, rating, title, content } = req.body;
    
    // Verificar si ya existe reseña
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND album_id = $2',
      [req.user.id, album_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reseñado este álbum'
      });
    }

    const result = await query(
      `INSERT INTO reviews (user_id, album_id, rating, title, content) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, album_id, rating, title, content]
    );

    // Actualizar rating del álbum
    await query(
      `UPDATE albums 
       SET average_rating = (
         SELECT AVG(rating) FROM reviews WHERE album_id = $1
       ), total_ratings = (
         SELECT COUNT(*) FROM reviews WHERE album_id = $1
       )
       WHERE id = $1`,
      [album_id]
    );

    const review = result.rows[0];

    // Obtener datos del usuario para la respuesta
    const userResult = await query(
      'SELECT id, username, profile_name, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );

    res.status(201).json({
      success: true,
      review: {
        ...review,
        user: userResult.rows[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, album_id } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT r.*, u.username, u.profile_name, u.avatar_url 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    let params = [limit, offset];

    if (album_id) {
      queryText += ' WHERE r.album_id = $3';
      params.push(album_id);
    }

    queryText += ' ORDER BY r.created_at DESC LIMIT $1 OFFSET $2';

    const result = await query(queryText, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      reviews: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
