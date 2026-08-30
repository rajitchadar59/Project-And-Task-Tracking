const express = require('express');
const { createTask, getProjectTasks, updateTaskStatus } = require('../controllers/taskController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');


const router = express.Router();


router.use(authMiddleware);


router.get('/project/:projectId', getProjectTasks);
router.patch('/:id/status', updateTaskStatus);


router.post('/', authorizeRole('Manager'), createTask);

module.exports = router;