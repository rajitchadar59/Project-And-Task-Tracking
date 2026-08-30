const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dependencies, dueDate } = req.body;

  
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      dependencies,
      dueDate
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
};

const getProjectTasks = async (req, res) => {
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

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id).populate('dependencies');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (status !== 'Backlog' && task.dependencies.length > 0) {
      const incompleteDependencies = task.dependencies.filter(dep => dep.status !== 'Done');
      
      if (incompleteDependencies.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot update status. Complete dependent tasks first.',
          incompleteDependencies
        });
      }
    }

    task.status = status;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update task status' });
  }
};

module.exports = { createTask, getProjectTasks, updateTaskStatus };