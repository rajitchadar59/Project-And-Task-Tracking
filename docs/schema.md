# Database Schema

As of the current phase, we have implemented the foundation for authentication and role management.

**Users Table (MongoDB Collection: `users`)**
*   `_id`: ObjectId (Primary Key)
*   `name`: String (Required)
*   `username`: String (Required, Unique, Trimmed)
*   `email`: String (Required, Unique, Lowercase)
*   `password`: String (Required, Hashed via bcrypt)
*   `role`: String (Enum: 'Manager', 'Member', Default: 'Member')
*   `createdAt` / `updatedAt`: Date (Managed via timestamps)

**Relationships**
*   Currently standalone. Future iterations will map a One-to-Many relationship between Users (Managers) and Projects, and Many-to-Many relationships for task assignments.

**Constraints**
*   **Database-level:** `unique` indexes on `email` and `username` ensure no duplicates at the storage layer.
*   **Application-level:** Mongoose enforces `required` fields, string formatting (lowercase/trim), and strictly limits the `role` field to the predefined enum array. 

**Denormalization**
*   None yet. The user model is strictly normalized. 

**Scaling at 100x Data**
*   With 100x the users, the login and signup routes would remain relatively stable because MongoDB automatically indexes `unique` fields (`email` and `username`).
*   What would break first: Fetching a list of "All Members" for a Manager to assign tasks to. A simple `User.find({ role: 'Member' })` without pagination would crash the Node.js memory limit. We will need to implement cursor-based or limit/offset pagination when building the assignment UI.

**Actual Schema Code (`models/User.js`)**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Manager', 'Member'],
    default: 'Member',
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);