const secretApplicantService = require('../services/secretApplicant.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');

const submitApplication = asyncWrapper(async (req, res, next) => {
  if (!req.body.cvUrl) {
      return next(createError(400, 'FAIL', 'CV upload is required'));
  }
  
  const application = await secretApplicantService.submitApplication(req.body);
  res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
});

const getApplications = asyncWrapper(async (req, res, next) => {
  const { page, limit, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const result = await secretApplicantService.getApplications(filter, { 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 10 
  });
  res.status(200).json({ success: true, data: result });
});

const getApplicationById = asyncWrapper(async (req, res, next) => {
  const application = await secretApplicantService.getApplicationById(req.params.id);
  if (!application) return next(createError(404, 'FAIL', 'Application not found'));
  res.status(200).json({ success: true, data: application });
});

const reviewApplication = asyncWrapper(async (req, res, next) => {
  const { status, notes } = req.body;
  if (!status) return next(createError(400, 'FAIL', 'Status is required'));

  const application = await secretApplicantService.reviewApplication(req.params.id, status, notes, req.user._id);
  if (!application) return next(createError(404, 'FAIL', 'Application not found'));
  res.status(200).json({ success: true, data: application });
});

module.exports = { submitApplication, getApplications, getApplicationById, reviewApplication };
