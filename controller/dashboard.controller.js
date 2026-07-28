const dashboardService = require('../services/dashboard.service');
const asyncWrapper = require("../middleware/asyncWrapper");
const ApiResponse = require('../utils/apiResponse');

const getLeaderDashboard = asyncWrapper(async (req, res) => {
    const metrics = await dashboardService.getLeaderMetrics();
    res.status(200).json(new ApiResponse(200, metrics, "Leader metrics fetched successfully"));
});

const getCommitteeDashboard = asyncWrapper(async (req, res) => {
    // The committee should come from the logged-in user's profile (req.decoded.email -> Member lookup handled in middleware, or we fetch here)
    // But since the Head only governs their own committee, we can pull it directly.
    const Member = require('../models/member');
    const member = await Member.findOne({ email: req.decoded.email });
    
    if (!member) {
        throw require('../utils/createError')(404, 'Fail', 'Member not found');
    }

    const metrics = await dashboardService.getCommitteeMetrics(member.committee);
    res.status(200).json(new ApiResponse(200, metrics, `${member.committee} metrics fetched successfully`));
});

module.exports = {
    getLeaderDashboard,
    getCommitteeDashboard
};
