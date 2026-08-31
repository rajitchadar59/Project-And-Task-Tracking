const Project = require('../models/Project');
const Task = require('../models/Task');

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const project = await Project.create({
      name,
      description,
      owner: req.userId,
      members: members || [] 
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project' });
  }
};

const getProjects = async (req, res) => {
  try {
    let query = { isArchived: false };

    
    if (req.role === 'Member') {
      query.members = req.userId;
    }
    

    const projects = await Project.find(query)
      .populate('owner', 'name username email')
      .populate('members', 'name email'); 
      
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};



const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    const project = await Project.findOne({ _id: id, owner: req.userId });
    if (!project) return res.status(404).json({ error: 'Project not found or unauthorized' });

    const oldMembers = project.members.map(m => m.toString());
    const newMembers = members || [];
    const removedMembers = oldMembers.filter(m => !newMembers.includes(m));

    
    project.name = name || project.name;
    project.description = description || project.description;
    project.members = newMembers;
    await project.save();

    if (removedMembers.length > 0) {
      await Task.updateMany(
        { project: id, assignedTo: { $in: removedMembers } },
        { $unset: { assignedTo: 1 } } 
      );
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project' });
  }
};

const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
  
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId }, 
      { isArchived: true },
      { returnDocument: 'after' } 
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or you are not the owner' });
    }
    res.status(200).json({ message: 'Project archived successfully', project });
  } catch (error) {
    res.status(400).json({ error: 'Failed to archive project' });
  }
};

const restoreProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId }, 
      { isArchived: false },
      { returnDocument: 'after' } 
    );
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json({ message: 'Project restored', project });
  } catch (error) {
    res.status(400).json({ error: 'Failed to restore project' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name')
      .populate('members', 'name email');
      
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};



const getArchivedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: true })
      .populate('owner', 'name')
      .populate('members', 'name email');
      
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch archived projects' });
  }
};




module.exports = { createProject, getProjects, archiveProject, updateProject, restoreProject , getProjectById , getArchivedProjects};

