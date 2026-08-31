const express = require('express');
const { createProject, getProjects, archiveProject, updateProject, restoreProject , getProjectById} = require('../controllers/projectController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);


router.post('/', authorizeRole('Manager'), createProject);
router.patch('/:id', authorizeRole('Manager'), updateProject); // Edit project
router.patch('/:id/archive', authorizeRole('Manager'), archiveProject); // Archive
router.patch('/:id/restore', authorizeRole('Manager'), restoreProject); // Restore
router.get('/:id', getProjectById);

module.exports = router;