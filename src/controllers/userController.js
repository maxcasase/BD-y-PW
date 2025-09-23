const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener estadísticas del usuario
    const stats = await User.getUserStats(req.params.id);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        stats
      }
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
    
    const updated = await User.updateProfile(req.user.id, {
      profile_name,
      bio,
      avatar_url
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = await User.findById(req.user.id);

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

exports.followUser = async (req, res) => {
  try {
    const result = await User.followUser(req.user.id, req.params.id);

    if (result === 'ALREADY_FOLLOWING') {
      return res.status(400).json({
        success: false,
        message: 'Ya sigues a este usuario'
      });
    }

    if (result === 'SELF_FOLLOW') {
      return res.status(400).json({
        success: false,
        message: 'No puedes seguirte a ti mismo'
      });
    }

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