const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'ON_HOLD'], default: 'PLANNING' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  github: String,
  images: [String],
  videos: [String],
  documentation: String,
  
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  committee: { type: String, required: true },
  
  componentsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  milestones: [milestoneSchema],
  
  deadlines: {
    startDate: Date,
    endDate: Date
  },
  sponsors: [String]
}, { timestamps: true });

projectSchema.index({ status: 1 });
projectSchema.index({ committee: 1 });
projectSchema.index({ leader: 1 });

module.exports = mongoose.model('Project', projectSchema);
