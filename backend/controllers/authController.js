const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Username already in use' });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      role: 'Member' 
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ 
      user: { id: user._id, username: user.username, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ 
      user: { id: user._id, username: user.username, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const createManager = async (req, res) => {
  try {
    const { name, username, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Forbidden: Invalid Admin Secret' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Username already exists' });
    }

    const manager = await User.create({
      name,
      username,
      email,
      password,
      role: 'Manager'
    });

    const token = generateToken(manager._id, manager.role);
    res.status(201).json({ message: 'Manager created successfully', token });
  } catch (error) {
    console.error("MANAGER CREATION ERROR:", error);
    res.status(500).json({ error: 'Server error during manager creation' });
  }
};

module.exports = { signup, login, createManager };