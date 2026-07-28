const mongoose = require('mongoose');
const { MESSAGE_STATUS } = require('../utils/constants');

const messageSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(MESSAGE_STATUS || { UNREAD: 'UNREAD', READ: 'READ' }),
    default: 'UNREAD'
  },
  links: [{ label: String, url: String }]
}, { timestamps: true });

messageSchema.index({ memberId: 1, status: 1 });

module.exports = mongoose.model('Message', messageSchema);
