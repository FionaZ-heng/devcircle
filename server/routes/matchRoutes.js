const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requestMatch, respondMatch, getMyMatches } = require('../controllers/matchController');

router.post('/', auth, requestMatch);
router.put('/:id', auth, respondMatch);
router.get('/', auth, getMyMatches);

module.exports = router;