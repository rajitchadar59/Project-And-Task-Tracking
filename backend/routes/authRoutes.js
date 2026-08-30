const express = require('express');
const { signup, login, createManager } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/hidden-manager', createManager);

module.exports = router;