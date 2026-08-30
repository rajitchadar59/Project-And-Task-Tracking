const express = require('express');
const { createProject, getProjects, archiveProject } = require('../controllers/projectController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);

router.post('/', authorizeRole('Manager'), createProject);

router.patch('/:id/archive', authorizeRole('Manager'), archiveProject);

module.exports = router;