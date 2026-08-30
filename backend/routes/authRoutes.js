const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({
      email,
      password,
      role: 'Member' 
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});


router.post('/hidden-manager', async (req, res) => {
  try {
    const { email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Forbidden: Invalid Admin Secret' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const manager = await User.create({
      email,
      password,
      role: 'Manager'
    });

    const token = generateToken(manager._id, manager.role);
    res.status(201).json({ message: 'Manager created successfully', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during manager creation' });
  }
});

module.exports = router;