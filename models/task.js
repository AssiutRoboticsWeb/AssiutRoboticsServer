const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE'], default: 'PENDING' },
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  submissionDate: { type: Date },
  
  taskUrl: String,
  submissionLink: String,
  downloadSubmissionUrl: String,
  submissionFileId: String,
  
  committee: String,
  assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  
  headEvaluation: { type: Number, default: -1 },
  headPercent: { type: Number, default: 60 },
  deadlineEvaluation: { type: Number, default: 0 },
  deadlinePercent: { type: Number, default: 40 },
  rate: Number,
  points: Number,

  attachments: [String],
  comments: [{
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
  labels: [String],
  reminders: [Date],
  recurring: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for optimization
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ committee: 1 });
taskSchema.index({ assignedMembers: 1 });

module.exports = mongoose.model('Task', taskSchema);
