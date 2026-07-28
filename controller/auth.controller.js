const Member = require('../models/member');
const Visits = require('../models/visits');
const jwt = require('../middleware/jwt');
const bcrypt = require('../middleware/bcrypt');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middleware/asyncWrapper');
const { MEMBER_ROLES } = require('../utils/constants');

const login = asyncWrapper(async (req, res, next) => {
    const { email, password, ip } = req.body;

    if (!email || !password) {
        return next(createError(400, httpStatusText.FAIL, "Email and password are required"));
    }

    const member = await Member.findOne({ email });

    if (!member) {
        return next(createError(404, httpStatusText.FAIL, "User not found"));
    }

    if (!member.verified) {
        return next(createError(403, httpStatusText.FAIL, "Please verify your email before logging in"));
    }

    if (member.role === MEMBER_ROLES.NOT_ACCEPTED) {
        return next(createError(401, httpStatusText.FAIL, "Your account is pending acceptance"));
    }

    const isMatch = await bcrypt.comparePassword(password, member.password);
    if (!isMatch) {
        return next(createError(400, httpStatusText.FAIL, "Invalid credentials"));
    }

    // Generate tokens
    const accessToken = jwt.generateToken({ id: member._id, email: member.email, role: member.role });
    const refreshToken = jwt.generateRefreshToken({ id: member._id, email: member.email });

    member.refreshToken = refreshToken;

    // Record visit if IP provided
    if (ip) {
        let visit = await Visits.findOne({ ip });
        if (!visit) {
            visit = await Visits.create({ ip });
        }
        if (!member.visits.includes(visit._id)) {
            member.visits.push(visit._id);
        }
    }

    await member.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        data: {
            token: accessToken,
            memberData: {
                id: member._id,
                name: member.name,
                email: member.email,
                role: member.role,
                committee: member.committee,
                avatar: member.avatar
            }
        },
        message: "Successfully logged in"
    });
});

const refresh = asyncWrapper(async (req, res, next) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
        return next(createError(401, httpStatusText.FAIL, "Unauthorized: No refresh token provided"));
    }

    const refreshToken = cookies.jwt;

    const member = await Member.findOne({ refreshToken });
    if (!member) {
        return next(createError(403, httpStatusText.FAIL, "Forbidden: Invalid refresh token"));
    }

    // Evaluate JWT
    const jwtLib = require('jsonwebtoken');
    jwtLib.verify(
        refreshToken,
        process.env.REFRESH_SECRET || process.env.SECRET,
        (err, decoded) => {
            if (err || member.email !== decoded.email) {
                return next(createError(403, httpStatusText.FAIL, "Forbidden: Invalid or expired refresh token"));
            }

            const accessToken = jwt.generateToken({ id: member._id, email: member.email, role: member.role });
            
            res.status(200).json({
                success: true,
                data: { token: accessToken }
            });
        }
    );
});

const logout = asyncWrapper(async (req, res, next) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content
    }
    
    const refreshToken = cookies.jwt;
    
    // Check if member exists with this refresh token
    const member = await Member.findOne({ refreshToken });
    if (member) {
        // Delete refresh token in db
        member.refreshToken = '';
        await member.save();
    }
    
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { login, refresh, logout };
