const SecretApplicant = require('../models/secretApplicant');

class SecretApplicantService {
  async submitApplication(data) {
    return await SecretApplicant.create(data);
  }

  async getApplications(filter, options) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const applications = await SecretApplicant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('reviewedBy', 'name email');
      
    const total = await SecretApplicant.countDocuments(filter);
    
    return { applications, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getApplicationById(id) {
    return await SecretApplicant.findById(id).populate('reviewedBy', 'name email');
  }

  async reviewApplication(id, status, notes, reviewerId) {
    return await SecretApplicant.findByIdAndUpdate(
      id,
      { status, reviewNotes: notes, reviewedBy: reviewerId },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'name email');
  }
}

module.exports = new SecretApplicantService();
