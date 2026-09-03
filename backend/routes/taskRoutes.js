const express = require('express');
const { 
  createTask, 
  getTasksByProject, 
  updateTask, 
  deleteTask, 
  getGlobalTasks, 
  batchUpdateTasks,
  getDashboardStats,
  addTaskComment,
  dismissAlert,
   getAlerts 
} = require('../controllers/taskController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');


const router = express.Router();

router.use(authMiddleware);

router.get('/global', getGlobalTasks);
router.get('/stats', getDashboardStats);
router.get('/alerts', authMiddleware, getAlerts); 

router.post('/', createTask);

router.get('/project/:projectId', getTasksByProject);
router.patch('/batch', batchUpdateTasks);
router.patch('/:id', updateTask);
router.post('/:id/comments', addTaskComment);
router.post('/:id/dismiss-alert', dismissAlert); 
router.delete('/:id', authorizeRole('Manager'), deleteTask);

module.exports = router;