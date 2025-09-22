const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', getUserProfile);
router.get('/:id/stats', getUserStats);
router.put('/profile', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;