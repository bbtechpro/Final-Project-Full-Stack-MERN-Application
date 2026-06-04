const { Schema, model } = require('mongoose');
const { User } = require('./userSchema');
 
const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  completedAt: {
    type: Date,
    default: null,
  },
});
 
const Project = model('Project', projectSchema);

module.exports = { Project };