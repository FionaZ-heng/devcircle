const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { submitReview, getGivenReviews, getUserReviews } = require('../controllers/reviewController');

router.post('/', auth, submitReview);
router.get('/given', auth, getGivenReviews); // must be before /:userId
router.get('/:userId', getUserReviews);

module.exports = router;
