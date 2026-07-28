const jwt = require('jsonwebtoken');
const createError = require("../utils/createError");
const httpStatusText = require("../utils/httpStatusText");

const generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign(payload, process.env.SECRET, { expiresIn });
};

const generateRefreshToken = (payload, expiresIn = "7d") => {
    // Fallback to SECRET if REFRESH_SECRET is not set in env
    return jwt.sign(payload, process.env.REFRESH_SECRET || process.env.SECRET, { expiresIn });
};

const verify = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        let token = req.params.token || req.cookies?.jwt;

        if (!token && authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
                token = parts[1].trim();
            }
        }

        if (!token) {
            return next(createError(401, httpStatusText.FAIL, "Unauthorized: Token is required"));
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        req.decoded = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(createError(401, httpStatusText.FAIL, "Unauthorized: Token expired"));
        } else if (error.name === "JsonWebTokenError") {
            return next(createError(401, httpStatusText.FAIL, "Unauthorized: Invalid token"));
        }
        return next(createError(500, httpStatusText.FAIL, "Internal server error"));
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verify
};