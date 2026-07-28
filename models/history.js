const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
  targetModel: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ip: String,
  device: String,
  createdAt: { type: Date, default: Date.now, immutable: true }
});

historySchema.index({ action: 1 });
historySchema.index({ actor: 1 });
historySchema.index({ createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
