const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  

  status: { 
    type: String, 
    enum: ['Backlog', 'In Progress', 'In Review', 'Done', 'Blocked'], 
    default: 'Backlog' 
  },

  previousStatus: { 
    type: String,
    enum: ['Backlog', 'In Progress', 'In Review', null],
    default: null
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: { type: Date },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  

  assignedTo: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  dependencies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],


  dismissedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  history: [{
    action: { type: String, required: true },
    details: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);