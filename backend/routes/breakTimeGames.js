const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getPublicGames } = require('../controllers/breakTimeGameController');

const router = express.Router();

router.get('/', authenticate, getPublicGames);

module.exports = router;
