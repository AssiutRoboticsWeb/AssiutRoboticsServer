const express = require('express');
const Router = express.Router();

const dashboardController = require('../controller/dashboard.controller');
const JWT = require('../middleware/jwt');
const Member = require('../models/member');
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');
const { MEMBER_ROLES } = require('../utils/constants');

// Middleware to restrict access to Leaders
const leaderOnly = asyncWrapper(async (req, res, next) => {
    const member = await Member.findOne({ email: req.decoded.email });
    if (!member || (member.role !== MEMBER_ROLES.LEADER && member.role !== MEMBER_ROLES.VICE_LEADER)) {
        throw createError(403, 'Fail', "Access denied. Leaders only.");
    }
    next();
});

// Middleware to restrict access to Heads (or Leaders)
const headOrLeaderOnly = asyncWrapper(async (req, res, next) => {
    const member = await Member.findOne({ email: req.decoded.email });
    const allowedRoles = [MEMBER_ROLES.LEADER, MEMBER_ROLES.VICE_LEADER, MEMBER_ROLES.HEAD, MEMBER_ROLES.VICE];
    if (!member || !allowedRoles.includes(member.role)) {
        throw createError(403, 'Fail', "Access denied. Heads/Leaders only.");
    }
    next();
});

Router.get('/leader', JWT.verify, leaderOnly, dashboardController.getLeaderDashboard);
Router.get('/committee', JWT.verify, headOrLeaderOnly, dashboardController.getCommitteeDashboard);

module.exports = Router;
