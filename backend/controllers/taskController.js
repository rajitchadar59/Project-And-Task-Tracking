const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    let { title, description, priority, dueDate, project, assignedTo, dependencies } = req.body;
    
    if (assignedTo && !Array.isArray(assignedTo)) {
      assignedTo = [assignedTo];
    }

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ error: 'Project not found' });

    const task = await Task.create({
      title, description, priority, dueDate, project, assignedTo, dependencies,
      history: [{ action: 'Created', details: 'Task was created', user: req.userId }]
    });
    
    // FIXED: Populate dependencies and history so it doesn't break the frontend state on first create
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('dependencies', 'title status')
      .populate('history.user', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('dependencies', 'title status')
      .populate('history.user', 'name'); 
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, assignedTo, title, description, priority, dependencies, dueDate } = req.body;

    const task = await Task.findById(id).populate('dependencies');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (status && status !== task.status) {
      if (status === 'Blocked') {
        if (task.status !== 'In Progress' && task.status !== 'In Review') {
          return res.status(400).json({ error: 'Can only block tasks from In Progress or In Review' });
        }
        task.previousStatus = task.status;
      } 
      else if (task.status === 'Blocked') {
        if (status !== task.previousStatus) {
          return res.status(400).json({ error: `Unblocking must return task to ${task.previousStatus}` });
        }
        task.previousStatus = null;
      } 
      else if (status === 'Done') {
        if (task.status !== 'In Review') {
          return res.status(400).json({ error: 'Task must be In Review before moving to Done' });
        }
        const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
        if (incompleteDependencies.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot complete task. Dependencies are not done yet.',
            blockingTasks: incompleteDependencies.map(t => t.title)
          });
        }
      } 
      else if (status === 'In Progress') {
        if (task.status !== 'Backlog' && task.status !== 'Done') {
          return res.status(400).json({ error: 'Invalid move. Can only move to In Progress from Backlog or reopened from Done.' });
        }
      } 
      else if (status === 'In Review') {
        if (task.status !== 'In Progress' && task.status !== 'Done') {
          return res.status(400).json({ error: 'Invalid move. Can only move to In Review from In Progress or reopened from Done.' });
        }
      } 
      else if (status === 'Backlog') {
        if (task.status !== 'Done') {
          return res.status(400).json({ error: 'Invalid move. Cannot move backwards to Backlog unless reopening.' });
        }
      }

      task.history.push({ action: 'Update', details: `Status changed from ${task.status} to ${status}`, user: req.userId });
      task.status = status;
    }

    if (dueDate !== undefined) {
       // Convert both to comparable string format YYYY-MM-DD to avoid time zone mismatches
       const oldDateStr = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
       const newDateStr = dueDate ? new Date(dueDate).toISOString().split('T')[0] : '';
       
       if (oldDateStr !== newDateStr) {
          task.history.push({ action: 'Update', details: `Due date changed`, user: req.userId });
          task.dueDate = dueDate || null;
          task.dismissedBy = []; // Reset alert dismissals because date changed
       }
    }

    if (assignedTo !== undefined) {
      if (!Array.isArray(assignedTo)) assignedTo = [assignedTo];
      task.history.push({ action: 'Update', details: 'Task assignments were updated', user: req.userId });
      task.assignedTo = assignedTo;
    }
    
    if (priority && priority !== task.priority) {
      task.history.push({ action: 'Update', details: `Priority changed from ${task.priority} to ${priority}`, user: req.userId });
      task.priority = priority;
    }
    
    if (title && title !== task.title) {
        task.history.push({ action: 'Update', details: 'Title updated', user: req.userId });
        task.title = title;
    }
    if (description && description !== task.description) {
        task.history.push({ action: 'Update', details: 'Description updated', user: req.userId });
        task.description = description;
    }
    if (dependencies) {
        task.history.push({ action: 'Update', details: 'Dependencies updated', user: req.userId });
        task.dependencies = dependencies;
    }

    await task.save();
    
    // FIXED: Return populated task back to frontend so state isn't replaced with raw IDs
    const updatedPopulatedTask = await Task.findById(id)
        .populate('assignedTo', 'name email')
        .populate('dependencies', 'title status')
        .populate('history.user', 'name');

    res.status(200).json(updatedPopulatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    await Task.updateMany({ dependencies: id }, { $pull: { dependencies: id } });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
};

const getGlobalTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy, isOverdue } = req.query;
    
    let query = {};
    if (req.role === 'Member') query.assignedTo = req.userId; // Matches automatically inside array in MongoDB
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isOverdue === 'true') {
      query.dueDate = { $lt: new Date() }; 
      query.status = { $ne: 'Done' };      
    }

    let sortOptions = {};
    if (sortBy === 'dueDate') sortOptions.dueDate = 1; 
    else sortOptions.createdAt = -1; 

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .populate('history.user', 'name')
      .sort(sortOptions);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global tasks' });
  }
};

const batchUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'No tasks selected' });
    }

    const results = { successful: [], failed: [] };

    for (let id of taskIds) {
      try {
        const task = await Task.findById(id).populate('dependencies');
        if (!task) {
          results.failed.push({ taskId: id, title: 'Unknown', reason: 'Task not found' });
          continue;
        }

        
        if (updates.status && updates.status !== task.status) {
          const status = updates.status;
          let isValidMove = true;
          let failReason = '';

       
          if (status === 'Blocked') {
            if (task.status !== 'In Progress' && task.status !== 'In Review') {
              isValidMove = false;
              failReason = 'Can only block tasks from In Progress or In Review.';
            } else {
              task.previousStatus = task.status;
            }
          } 
         
          else if (task.status === 'Blocked') {
            if (status !== task.previousStatus) {
              isValidMove = false;
              failReason = `Unblocking must return task strictly to ${task.previousStatus}.`;
            } else {
              task.previousStatus = null;
            }
          } 
      
          else if (status === 'Done') {
            if (task.status !== 'In Review') {
              isValidMove = false;
              failReason = 'Task must be In Review before moving to Done.';
            } else {
              const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
              if (incompleteDependencies.length > 0) {
                isValidMove = false;
                failReason = `Cannot complete task. Blocking dependencies: ${incompleteDependencies.map(t=>t.title).join(', ')}.`;
              }
            }
          } 
    
          else if (status === 'In Progress') {
            if (task.status !== 'Backlog' && task.status !== 'Done') {
              isValidMove = false;
              failReason = 'Can only move to In Progress from Backlog or when reopening from Done.';
            }
          } 
         
          else if (status === 'In Review') {
            if (task.status !== 'In Progress' && task.status !== 'Done') {
              isValidMove = false;
              failReason = 'Can only move to In Review from In Progress or when reopening from Done.';
            }
          } 
       
          else if (status === 'Backlog') {
            if (task.status !== 'Done') {
              isValidMove = false;
              failReason = 'Cannot move backwards to Backlog unless reopening a completed task from Done.';
            }
          }


          if (!isValidMove) {
            results.failed.push({ taskId: id, title: task.title, reason: failReason });
            continue; // Move to the next task in the loop
          }

   
          task.history.push({ action: 'Update', details: `Batch: Status changed from ${task.status} to ${status}`, user: req.userId });
          task.status = status;
        }

      
        if (updates.dueDate !== undefined) {
             const oldDateStr = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
             const newDateStr = updates.dueDate ? new Date(updates.dueDate).toISOString().split('T')[0] : '';
             
             if (oldDateStr !== newDateStr) {
                 task.dueDate = updates.dueDate || null;
                 task.dismissedBy = []; // Nayi due date aane par purane alerts reset hote hain
                 task.history.push({ action: 'Update', details: 'Batch: Due date changed', user: req.userId });
             }
        }

       
        if (updates.assignedTo !== undefined) {
          let newAssignees = Array.isArray(updates.assignedTo) ? updates.assignedTo : [updates.assignedTo];
          task.history.push({ action: 'Update', details: 'Batch: Assignment changed', user: req.userId });
          task.assignedTo = newAssignees;
        }

       
        await task.save();
        results.successful.push({ taskId: id, title: task.title });
        
      } catch (err) {
        results.failed.push({ taskId: id, title: 'Error', reason: 'Server error on this task' });
      }
    }

   
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process batch update' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let query = {};
    if (req.role === 'Member') query.assignedTo = req.userId;

    const tasks = await Task.find(query).populate('assignedTo', 'name');
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); 
    startOfThisWeek.setHours(0, 0, 0, 0);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);
    const startOf8WeeksAgo = new Date(startOfThisWeek);
    startOf8WeeksAgo.setDate(startOfThisWeek.getDate() - (7 * 7));

    let stats = {
      open: 0, overdue: 0, dueThisWeek: 0, completedThisWeek: 0,
      byStatus: { 'Backlog': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0, 'Blocked': 0 },
      byAssignee: {}, completionsByWeek: {} 
    };

    for(let i = 7; i >= 0; i--) {
      let weekStart = new Date(startOfThisWeek);
      weekStart.setDate(startOfThisWeek.getDate() - (i * 7));
      stats.completionsByWeek[weekStart.toLocaleDateString()] = 0;
    }

    tasks.forEach(t => {
      if (stats.byStatus[t.status] !== undefined) stats.byStatus[t.status]++;
      else stats.byStatus[t.status] = 1;

      if (t.assignedTo && t.assignedTo.length > 0) {
        t.assignedTo.forEach(user => {
          stats.byAssignee[user.name] = (stats.byAssignee[user.name] || 0) + 1;
        });
      } else {
        stats.byAssignee['Unassigned'] = (stats.byAssignee['Unassigned'] || 0) + 1;
      }

      if (t.status !== 'Done') {
        stats.open++;
        if (t.dueDate) {
          const due = new Date(t.dueDate);
          if (due < now) stats.overdue++;
          if (due >= startOfThisWeek && due <= endOfThisWeek) stats.dueThisWeek++;
        }
      } else {
        const updated = new Date(t.updatedAt || t.createdAt);
        if (updated >= startOfThisWeek && updated <= endOfThisWeek) stats.completedThisWeek++;
        
        if (updated >= startOf8WeeksAgo) {
          let taskWeekStart = new Date(updated);
          taskWeekStart.setDate(updated.getDate() - updated.getDay());
          taskWeekStart.setHours(0, 0, 0, 0);
          const weekKey = taskWeekStart.toLocaleDateString();
          if (stats.completionsByWeek[weekKey] !== undefined) stats.completionsByWeek[weekKey]++;
        }
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) return res.status(400).json({ error: 'Comment text is required' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.history.push({ action: 'Comment', details: comment, user: req.userId });
    await task.save();
    
    const populatedTask = await Task.findById(id).populate('history.user', 'name');
    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

const dismissAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!task.dismissedBy.includes(req.userId)) {
      task.dismissedBy.push(req.userId);
      await task.save();
    }
    res.status(200).json({ message: 'Alert dismissed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
};

module.exports = { 
  createTask, getTasksByProject, updateTask, deleteTask, 
  getGlobalTasks, batchUpdateTasks, getDashboardStats, addTaskComment, dismissAlert 
};