const mongoose = require('mongoose');

const secretApplicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  university: { type: String, required: true },
  faculty: { type: String, required: true },
  department: String,
  graduationYear: String,
  
  experience: String,
  skills: [String],
  links: [{ label: String, url: String }],
  
  cvUrl: { type: String, required: true },
  
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  reviewNotes: String
}, { timestamps: true });

secretApplicantSchema.index({ status: 1 });
secretApplicantSchema.index({ email: 1 });

module.exports = mongoose.model('SecretApplicant', secretApplicantSchema);
