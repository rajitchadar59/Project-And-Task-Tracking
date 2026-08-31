const express = require('express');
const { createTask, getTasksByProject, updateTask, deleteTask, getGlobalTasks , batchUpdateTasks } = require('../controllers/taskController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/global', getGlobalTasks);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.patch('/batch', batchUpdateTasks);
router.patch('/:id', updateTask);


router.delete('/:id', authorizeRole('Manager'), deleteTask);

module.exports = router;