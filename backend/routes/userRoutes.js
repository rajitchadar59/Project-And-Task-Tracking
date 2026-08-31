const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/', authMiddleware, authorizeRole('Manager'), getAllUsers);

module.exports = router;