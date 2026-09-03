const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


const getScopedUsers = async (req, res) => {
  try {
    if (req.role === 'Member') {
    
      const projects = await Project.find({ members: req.userId }).populate('members', 'name email');
      
   
      const memberMap = new Map();
      projects.forEach(project => {
        project.members.forEach(m => {
          memberMap.set(m._id.toString(), { _id: m._id, name: m.name, email: m.email });
        });
      });
      
      return res.status(200).json(Array.from(memberMap.values()));
    } else {
  
      const users = await User.find().select('name email role');
      return res.status(200).json(users);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scoped users' });
  }
};

module.exports = { getAllUsers , getScopedUsers };