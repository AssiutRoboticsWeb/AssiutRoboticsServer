const Member = require('../models/member');
const createError = require('../utils/createError');
const asyncWrapper = require('./asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');

const roleChecker = (...allowedRoles) => {
    return asyncWrapper(async (req, res, next) => {
        if (!req.decoded || (!req.decoded.email && !req.decoded.id)) {
            return next(createError(401, httpStatusText.FAIL, "Unauthorized."));
        }
        
        const query = req.decoded.id ? { _id: req.decoded.id } : { email: req.decoded.email };
        const member = await Member.findOne(query);
        
        if (!member) {
            return next(createError(404, httpStatusText.FAIL, "User not found"));
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
            return next(createError(403, httpStatusText.FAIL, "Unauthorized: Insufficient role"));
        }
        
        req.user = member; 
        next();
    });
};

module.exports = roleChecker;