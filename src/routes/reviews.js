const express = require('express');
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, validateReview, createReview);

module.exports = router;
