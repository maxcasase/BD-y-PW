const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('profile.favoriteGenres')
      .populate('followers', 'username profile')
      .populate('following', 'username profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    const { name, bio, favoriteGenres } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'profile.name': name,
        'profile.bio': bio,
        'profile.favoriteGenres': favoriteGenres
      },
      { new: true, runValidators: true }
    );

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
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    if (req.user.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to current user's following
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });

    // Add to target user's followers
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });

    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    const stats = {
      followers: user.followers.length,
      following: user.following.length,
      // You can add more stats here from other collections
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};