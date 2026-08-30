const Project = require('../models/Project');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
   
    const project = await Project.create({
      name,
      description,
      owner: req.userId 
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project' });
  }
};

const getProjects = async (req, res) => {
  try {
   
    const projects = await Project.find({ isArchived: false })
      .populate('owner', 'name username email');
      
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
  
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId }, 
      { isArchived: true },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or you are not the owner' });
    }
    res.status(200).json({ message: 'Project archived successfully', project });
  } catch (error) {
    res.status(400).json({ error: 'Failed to archive project' });
  }
};

module.exports = { createProject, getProjects, archiveProject };