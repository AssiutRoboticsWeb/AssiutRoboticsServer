const Member = require('../models/member');

const authorizeRoles = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.decoded || (!req.decoded.email && !req.decoded.id)) {
                return res.status(401).json({ message: "Unauthorized. No valid token data provided." });
            }

            const query = req.decoded.id ? { _id: req.decoded.id } : { email: req.decoded.email };
            const user = await Member.findOne(query);

            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    };
};

module.exports = authorizeRoles;
