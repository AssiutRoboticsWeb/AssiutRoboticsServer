const express = require('express');
const router = express.Router();
const secretApplicantController = require('../controller/secretApplicant.controller');
const { verify } = require('../middleware/jwt'); 
const roleChecker = require('../middleware/roleChecker');
const { MEMBER_ROLES } = require('../utils/constants');

// Public route for anyone to apply
router.post('/', secretApplicantController.submitApplication);

// Protected routes for HR / Leaders / President
router.use(verify);
router.get('/', roleChecker('HR', MEMBER_ROLES.HR_LEADER, MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT), secretApplicantController.getApplications);
router.get('/:id', roleChecker('HR', MEMBER_ROLES.HR_LEADER, MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT), secretApplicantController.getApplicationById);
router.put('/:id/review', roleChecker('HR', MEMBER_ROLES.HR_LEADER, MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT), secretApplicantController.reviewApplication);

module.exports = router;
