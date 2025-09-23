const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  followUser 
} = require('../controllers/userController'); 
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);


module.exports = router;
