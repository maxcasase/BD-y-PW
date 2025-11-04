const express = require('express');
const { createReview, getReviews, getUserReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

router.get('/', getReviews);
router.get('/me', protect, getUserReviews);
router.post('/', protect, validateReview, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;