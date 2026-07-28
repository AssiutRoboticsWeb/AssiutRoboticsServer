const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  type: { type: String, enum: ['ALERT', 'WARNING', 'INFO'], required: true },
  title: String,
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ memberId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
