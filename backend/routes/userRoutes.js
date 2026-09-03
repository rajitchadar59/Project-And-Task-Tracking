const express = require('express');
const { getAllUsers , getScopedUsers} = require('../controllers/userController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/', authMiddleware, authorizeRole('Manager'), getAllUsers);
router.get('/scoped-users', authMiddleware, getScopedUsers);

module.exports = router;