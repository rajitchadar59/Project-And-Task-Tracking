const express = require('express');
const { createProject, getProjects, archiveProject, updateProject, restoreProject, getProjectById, getArchivedProjects } = require('../controllers/projectController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);


router.get('/archived', authorizeRole('Manager'), getArchivedProjects);

router.post('/', authorizeRole('Manager'), createProject);
router.patch('/:id', authorizeRole('Manager'), updateProject); 
router.patch('/:id/archive', authorizeRole('Manager'), archiveProject);
router.patch('/:id/restore', authorizeRole('Manager'), restoreProject); 
router.get('/:id', getProjectById);

module.exports = router;