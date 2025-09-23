const User = require('../models/User');
const { query } = require('../config/database');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { profile_name, bio, avatar_url } = req.body;
    
    const updatedUser = await User.updateProfile(req.user.id, {
      profile_name,
      bio,
      avatar_url
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.followUser = async (req, res) => {
  try {
    // Implementación básica - puedes mejorarla después
    const result = await query(
      'INSERT INTO user_followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Usuario seguido correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Si necesitas unfollow, agrega esta función:
exports.unfollowUser = async (req, res) => {
  try {
    await query(
      'DELETE FROM user_followers WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Dejaste de seguir al usuario'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
