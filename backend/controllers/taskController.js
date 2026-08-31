const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignedTo, dependencies } = req.body;
    
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ error: 'Project not found' });

    const task = await Task.create({
      title, description, priority, dueDate, project, assignedTo, dependencies
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
      .populate('dependencies', 'title status');
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, title, description, dependencies } = req.body;

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

    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
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

    if (req.role === 'Member') {
      query.assignedTo = req.userId;
    }

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
    if (sortBy === 'dueDate') {
      sortOptions.dueDate = 1; 
    } else {
      sortOptions.createdAt = -1; 
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
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

       
        if (updates.status === 'Done') {
          const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
          if (incompleteDependencies.length > 0) {
            results.failed.push({ 
              taskId: id, 
              title: task.title, 
              reason: 'Blocking tasks are not done yet' 
            });
            continue; 
          }
        }

        if (updates.status) task.status = updates.status;
        if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;

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


module.exports = { createTask, getTasksByProject, updateTask, deleteTask, getGlobalTasks, batchUpdateTasks };

