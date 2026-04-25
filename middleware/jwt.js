const jwt = require('jsonwebtoken');
const createError = require("../utils/createError")
const httpStatusText = require("../utils/httpStatusText")
const fs = require("fs")
const path = require('path');

const generateToken = () => {
    return async (payload, rememberMe) => {
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: rememberMe || "10h" });
        return token;
    }
}

const verify = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        const requestDetails = `Method: ${req.method}, URL: ${req.originalUrl}, IP: ${req.ip}`;

        if (!authHeader && !req.params.token) {
            console.error(`[JWT Error] Missing token. ${requestDetails}`);
            return res.status(401).json({ status: httpStatusText.FAIL, message: "Token is required" });
        }

        let token = req.params.token;
        if (!token && authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
                token = parts[1].trim();
            } else {
                console.error(`[JWT Error] Malformed auth header. ${requestDetails}, Header: ${authHeader}`);
                return res.status(401).json({ status: httpStatusText.FAIL, message: "Malformed authorization header" });
            }
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.decoded = decoded;
            console.log(`[JWT Success] Token verified. ${requestDetails}, User: ${decoded.email}`);
            next();
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                console.error(`[JWT Error] Token expired. ${requestDetails}, Token: ${token}`);
                return res.status(401).json({ status: httpStatusText.FAIL, message: "Token expired" });
            } else if (jwtError.name === "JsonWebTokenError") {
                console.error(`[JWT Error] Invalid token. ${requestDetails}, Token: ${token}`);
                return res.status(401).json({ status: httpStatusText.FAIL, message: "Invalid token" });
            } else {
                console.error(`[JWT Error] Unexpected error. ${requestDetails}, Error: ${jwtError.message}`);
                return res.status(500).json({ status: httpStatusText.FAIL, message: "Internal server error" });
            }
        }
    } catch (error) {
        console.error(`[JWT Catch Error] ${requestDetails} | Error: ${error.name} - ${error.message}`);
        return res.status(500).json({ status: httpStatusText.FAIL, message: "Internal server error" });
    }
};

module.exports = {
    generateToken,
    verify
}