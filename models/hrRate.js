const mongoose = require('mongoose');

const hrRateSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  month: { type: String, required: true },
  meetingScore: { type: Number, default: 0 },
  behaviorScore: { type: Number, default: 0 },
  interactionScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  notes: String
}, { timestamps: true });

hrRateSchema.index({ memberId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('HRRate', hrRateSchema);
