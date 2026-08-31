const express = require('express');
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;