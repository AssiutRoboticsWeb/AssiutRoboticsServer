const multer = require("multer");
const path = require("path");
const createError = require("../utils/createError");
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${file.fieldname}_${Date.now()}${ext}`;
        req.generatedFilename = filename; 
        cb(null, filename);
    }
});

const imageFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(createError(400, "Fail", "Only image files (JPG, PNG, WEBP) are allowed"), false);
    }
    cb(null, true);
};

const documentFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(createError(400, "Fail", "Only document files (PDF, DOC, DOCX) are allowed"), false);
    }
    cb(null, true);
};

const multiFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("application/")) {
        cb(null, true);
    } else {
        cb(createError(400, "Fail", "Unsupported file type"), false);
    }
};

const uploadImage = multer({
    storage: diskStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadDocument = multer({
    storage: diskStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadMulti = multer({
    storage: diskStorage,
    fileFilter: multiFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

module.exports = {
    uploadImage,
    uploadDocument,
    uploadMulti
};
