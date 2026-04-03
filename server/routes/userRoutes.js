const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUser, updateMe } = require('../controllers/userController');

router.put('/me', auth, updateMe);
router.get('/:id', getUser);

module.exports = router;
