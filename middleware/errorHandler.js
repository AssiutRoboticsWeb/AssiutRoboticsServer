const httpStatusText = require('../utils/httpStatusText');

const errorHandler = (err, req, res, next) => {
    const isMongoConnectivityError = err?.name === 'MongooseServerSelectionError' || /buffering timed out/i.test(err?.message || '');
    let statusCode = err.statusCode || (isMongoConnectivityError ? 503 : 500);
    let statusText = err.statusText || httpStatusText.ERROR;
    let message = err.message || "Internal Server Error";

    // Handle specific errors like ValidationError (Mongoose)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        statusText = httpStatusText.FAIL;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    // Handle CastError (Invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        statusText = httpStatusText.FAIL;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        statusText = httpStatusText.FAIL;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field: ${field}. Please use another value.`;
    }

    if (statusCode === 500 && !isMongoConnectivityError) {
        message = "Internal Server Error";
    } else if (isMongoConnectivityError) {
        message = "Database is temporarily unavailable";
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
        console.error(`[${req.timestamp || new Date().toISOString()}] [Error ${statusCode}] [${req.method} ${req.originalUrl}]`);
        console.error('Error Message:', err.message);
        if (statusCode === 500) {
            console.error('Stack:', err.stack);
        }
    }

    res.status(statusCode).json({
        success: false,
        statusText,
        message,
        ...(isDevelopment && {
            error: err.message,
            stack: err.stack,
            requestId: req.id
        })
    });
};

module.exports = errorHandler;
