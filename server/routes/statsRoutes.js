const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMyStats } = require('../controllers/statsController');

router.get('/me', auth, getMyStats);

module.exports = router;