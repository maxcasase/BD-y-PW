const express = require('express');
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, validateReview, createReview);
router.put('/:id', protect, validateReview, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;