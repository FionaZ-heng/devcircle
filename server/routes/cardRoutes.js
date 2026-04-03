const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getCards, createCard, deleteCard } = require('../controllers/cardController');

router.get('/', getCards);
router.post('/', auth, createCard);
router.delete('/:id', auth, deleteCard);

module.exports = router;