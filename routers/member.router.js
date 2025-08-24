const express = require("express");
const memberController = require("../controller/member.controller");
const JWT = require("../middleware/jwt");
const Router = express.Router();
const multer = require("multer");
const otp = require("../utils/otp");
const { config } = require("../config/environment");
const { uploadToCloud } = require("../utils/cloudinary");

// Multer configuration for file uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        
        // Check file extension
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error("Only JPG, JPEG, PNG, and GIF files are allowed!"), false);
        }
        
        cb(null, true);
    }
});

// Profile image upload route
Router.route("/changeProfileImage").post(
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded.'
                });
            }
            
            // Upload image to Cloudinary
            const uploadResult = await uploadToCloud(req.file.buffer, {
                folder: 'profile-images',
                public_id: `profile_${Date.now()}`
            });
            
            req.imageUrl = uploadResult.url;
            req.publicId = uploadResult.publicId;
            next();
            
        } catch (error) {
            console.error('File upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    },
    JWT.verify,
    memberController.changeProfileImage
);

// Authentication routes
Router.route("/register").post(memberController.register);
Router.route("/login").post(memberController.login);
Router.route("/verify").get(JWT.verify, memberController.verify);

// Email verification
Router.route("/verifyEmail/:token").get(
    JWT.verify,
    memberController.verifyEmail
);

// Password management
Router.route("/changePassword").post(memberController.changePass);
Router.route("/generateOTP").post(memberController.generateOTP);
Router.route("/verifyOTP").post(memberController.verifyOTP);

// Member management
Router.route("/getAllMembers").get(memberController.getAllMembers);
Router.route("/get/:com").get(memberController.getCommittee);
Router.route("/confirm").post(JWT.verify, memberController.confirm);

// Role management
Router.route("/changeHead").post(JWT.verify, memberController.changeHead);
Router.route("/changeVice").post(JWT.verify, memberController.changeVice);

// HR and rating
Router.route("/hr").post(JWT.verify, memberController.controlHR);
Router.route("/rate").post(JWT.verify, memberController.rate);

module.exports = Router;
