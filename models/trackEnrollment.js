const mongoose = require('mongoose');

const trackEnrollmentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'DROPPED'], default: 'IN_PROGRESS' },
  courses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
    submittedTasks: [{
      task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
      submissionLink: String,
      submittedAt: { type: Date, default: Date.now },
      rate: String,
      notes: String
    }]
  }]
}, { timestamps: true });

trackEnrollmentSchema.index({ memberId: 1, track: 1 }, { unique: true });

module.exports = mongoose.model('TrackEnrollment', trackEnrollmentSchema);
