const Task = require('../models/Task');
const Project = require('../models/Project');

// Create a new task inside a project
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignedTo, dependencies } = req.body;
    
    // Check if project exists
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

// Get tasks for a specific project
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

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };