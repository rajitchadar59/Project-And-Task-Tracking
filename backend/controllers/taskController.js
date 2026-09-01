const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignedTo, dependencies } = req.body;
    
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ error: 'Project not found' });

    const task = await Task.create({
      title, description, priority, dueDate, project, assignedTo, dependencies,
      history: [{
        action: 'Created',
        details: 'Task was created',
        user: req.userId 
      }]
    });
    
    res.status(201).json(task);
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
    const { status, assignedTo, title, description, priority, dependencies } = req.body;

    const task = await Task.findById(id).populate('dependencies');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (status === 'Done') {
      const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
      if (incompleteDependencies.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot complete task. Dependencies are not done yet.',
          blockingTasks: incompleteDependencies.map(t => t.title)
        });
      }
    }

   
    if (status && status !== task.status) {
      task.history.push({ action: 'Update', details: `Status changed from ${task.status} to ${status}`, user: req.userId });
      task.status = status;
    }
    if (priority && priority !== task.priority) {
      task.history.push({ action: 'Update', details: `Priority changed from ${task.priority} to ${priority}`, user: req.userId });
      task.priority = priority;
    }
    if (assignedTo !== undefined && assignedTo !== task.assignedTo?.toString()) {
      task.history.push({ action: 'Update', details: 'Task assignment was changed', user: req.userId });
      task.assignedTo = assignedTo;
    }
    
    // Normal updates
    if (title) task.title = title;
    if (description) task.description = description;
    if (dependencies) task.dependencies = dependencies;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    
    await Task.updateMany(
      { dependencies: id },
      { $pull: { dependencies: id } }
    );

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
};

const getGlobalTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy, isOverdue } = req.query;
    
    let query = {};
    if (req.role === 'Member') query.assignedTo = req.userId;
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
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) return res.status(400).json({ error: 'No tasks selected' });

    const results = { successful: [], failed: [] };

    for (let id of taskIds) {
      try {
        const task = await Task.findById(id).populate('dependencies');
        if (!task) {
          results.failed.push({ taskId: id, title: 'Unknown', reason: 'Task not found' });
          continue;
        }
        
        if (updates.status === 'Done') {
          const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
          if (incompleteDependencies.length > 0) {
            results.failed.push({ taskId: id, title: task.title, reason: 'Blocking tasks are not done yet' });
            continue; 
          }
        }

        if (updates.status && updates.status !== task.status) {
          task.history.push({ action: 'Update', details: `Batch Update: Status changed to ${updates.status}`, user: req.userId });
          task.status = updates.status;
        }
        if (updates.assignedTo !== undefined && updates.assignedTo !== task.assignedTo?.toString()) {
          task.history.push({ action: 'Update', details: 'Batch Update: Assignment changed', user: req.userId });
          task.assignedTo = updates.assignedTo;
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
      byStatus: { 'To Do': 0, 'In Progress': 0, 'Done': 0 },
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

      const assigneeName = t.assignedTo ? t.assignedTo.name : 'Unassigned';
      stats.byAssignee[assigneeName] = (stats.byAssignee[assigneeName] || 0) + 1;

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

    task.history.push({
      action: 'Comment',
      details: comment,
      user: req.userId
    });

    await task.save();
    

    const populatedTask = await Task.findById(id).populate('history.user', 'name');
    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

module.exports = { 
  createTask, getTasksByProject, updateTask, deleteTask, 
  getGlobalTasks, batchUpdateTasks, getDashboardStats, addTaskComment 
};