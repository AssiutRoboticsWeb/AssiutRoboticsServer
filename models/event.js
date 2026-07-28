const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  time: String,
  title: String,
  speaker: String
});

const guestSchema = new mongoose.Schema({
  name: String,
  email: String,
  university: String,
  attended: { type: Boolean, default: false }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: String,
  onlineLink: String,
  
  speakers: [String],
  agenda: [agendaSchema],
  
  registrationOpen: { type: Boolean, default: true },
  registeredGuests: [guestSchema],
  attendedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  
  qrCode: String,
  remindersSent: { type: Boolean, default: false },
  certificatesGenerated: { type: Boolean, default: false },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }
}, { timestamps: true });

eventSchema.index({ date: 1 });
module.exports = mongoose.model('Event', eventSchema);
