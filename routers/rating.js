const express = require('express');
const router = express.Router();
const ratingController = require('../controller/rating.controller');
const jwt = require('../middleware/jwt');

// GET /rating/dashboard - Get rate dashboard data
router.get('/dashboard', jwt.verify, ratingController.getRateDashboardData);

// POST /rating/hr-rating - Submit HR rating
router.post('/hr-rating', jwt.verify, ratingController.submitHRRating);

// GET /rating/history/:memberId - Get member's rating history
router.get('/history/:memberId', jwt.verify, ratingController.getMemberRatingHistory);

// GET /rating/committee/:committee - Get committee performance summary
router.get('/committee/:committee', jwt.verify, ratingController.getCommitteePerformance);

module.exports = router;
