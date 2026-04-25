require('dotenv').config();

// ============================================
// Environment Variable Validation
// ============================================
const requiredEnvVars = ['PORT', 'MONGOURL', 'SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// ============================================
// Configuration
// ============================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';

// ============================================
// Dependencies
// ============================================
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
app.set('trust proxy', isProduction ? 1 : false);

// ============================================
// Routers
// ============================================
const memberRouter = require('./routers/member.router');
const blogRouter = require('./routers/blog.router');
const componentRouter = require('./routers/component.router');
const lapDateRouter = require('./routers/lapDates.js');
const visitRouter = require('./routers/visit.js');
const announcementRouter = require('./routers/announcement');
const meetingRouter = require('./routers/meeting');
const guestRouter = require('./routers/guest.js');
const webhookRoutes = require('./routers/webhook.router.js');
const trackRouter = require('./routers/track.js');
const courseRouter = require('./routers/course.js');
const applicantRouter = require('./routers/applicant.js');
const tracksysRouter = require('./routers/tracksys.js');

// ============================================
// Utils
// ============================================
const httpStatusText = require('./utils/httpStatusText');

// ============================================
// Security Middleware
// ============================================
// CORS Configuration
const defaultProductionOrigins = [
    'https://assiut-robotics-website-xi.vercel.app',
    'https://assiutrobotics.vercel.app',
    'https://assiut-robotics-website-zeta.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
];

const normalizeOrigin = (value) => {
    if (!value) return '';
    return value.trim().replace(/\/+$/, '');
};

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const allowedOrigins = isDevelopment
    ? null // null means allow all in callback
    : [...new Set([...defaultProductionOrigins, ...envAllowedOrigins].map(normalizeOrigin))];

const corsMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const corsHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'];

// Explicit CORS handling to guarantee preflight success on serverless platforms.
app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

    const isAllowedOrigin = isDevelopment
        ? true
        : (!requestOrigin || allowedOrigins.includes(normalizedRequestOrigin));

    if (requestOrigin && isAllowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', corsMethods.join(','));
    res.setHeader('Access-Control-Allow-Headers', corsHeaders.join(','));

    if (req.method === 'OPTIONS') {
        if (!isAllowedOrigin) {
            return res.status(403).json({
                success: false,
                message: `CORS: Origin ${requestOrigin} not allowed`
            });
        }
        return res.sendStatus(204);
    }

    return next();
});


// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isDevelopment ? 1000 : 100, // Higher limit in development
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`[Request] Method: ${req.method}, URL: ${req.originalUrl}, IP: ${req.ip}`);
    next();
});

// ============================================
// Database
// ============================================
const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        // Keep the server alive; requests that need DB will return controlled errors.
    }
};

// ============================================
// General Middleware
// ============================================
// Compression
app.use(compression());

// Body Parsing
const body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// Request Logging
if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body Parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// View Engine
app.set('view engine', 'ejs');

// Request ID and timestamp
app.use((req, res, next) => {
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.timestamp = new Date().toISOString();
    next();
});

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// ============================================
// API Routes
// ============================================
app.use("/api/members", memberRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/components", componentRouter);
app.use("/api/lap-dates", lapDateRouter);
app.use("/api/visits", visitRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/meeting", meetingRouter);
app.use("/api/guests", guestRouter);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/tracks", trackRouter);
app.use("/api/courses", courseRouter);
app.use("/api/applicants", applicantRouter);
app.use("/api/tracksys", tracksysRouter);

// Legacy routes (for backward compatibility)
app.use("/members", memberRouter);
app.use("/blogs", blogRouter);
app.use("/components", componentRouter);
app.use("/lap-dates", lapDateRouter);
app.use("/visits", visitRouter);
app.use("/announcements", announcementRouter);
app.use("/meetings", meetingRouter);
app.use("/meeting", meetingRouter);
app.use("/guests", guestRouter);
app.use("/webhooks", webhookRoutes);
app.use("/tracks", trackRouter);
app.use("/courses", courseRouter);
app.use("/applicants", applicantRouter);
app.use("/tracksys", tracksysRouter);

// ============================================
// Root Route
// ============================================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Assiut Robotics API",
        version: "1.0.0",
        status: "operational",
        endpoints: {
            health: "/health",
            api: "/api/*",
            docs: isDevelopment ? "/api-docs" : undefined
        }
    });
});

// Development test route
if (isDevelopment) {
    app.post("/test", (req, res) => {
        res.json({
            success: true,
            message: "POST route works",
            body: req.body,
            timestamp: req.timestamp
        });
    });
}

// Handle favicon.ico to prevent 404 logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ============================================
// 404 Handler
// ============================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        statusText: httpStatusText.FAIL,
        message: "API endpoint not found",
        path: req.originalUrl,
        method: req.method,
        timestamp: req.timestamp
    });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
    const isMongoConnectivityError = err?.name === 'MongooseServerSelectionError'
        || /buffering timed out/i.test(err?.message || '');
    const statusCode = err.statusCode || (isMongoConnectivityError ? 503 : 500);
    const statusText = err.statusText || httpStatusText.ERROR;

    // Log error details
    console.error(`[${req.timestamp}] [Error ${statusCode}] [${req.method} ${req.originalUrl}]`);
    console.error('Error:', err.message);

    if (isDevelopment) {
        console.error('Stack:', err.stack);
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        statusText,
        message: statusCode === 500
            ? "Internal Server Error"
            : (isMongoConnectivityError ? "Database is temporarily unavailable" : err.message),
        ...(isDevelopment && {
            error: err.message,
            stack: err.stack,
            requestId: req.id
        })
    });
});

// ============================================
// API Endpoints Documentation Generator
// ============================================
if (isDevelopment && process.env.GENERATE_API_ENDPOINTS === "true") {
    try {
        const listEndpoints = require('express-list-endpoints');
        const fs = require('fs');
        const path = require('path');

        const endpoints = listEndpoints(app);
        const endpointData = {
            endpoints: endpoints,
            generatedAt: new Date().toISOString(),
            totalEndpoints: endpoints.length,
            environment: NODE_ENV
        };

        fs.writeFileSync(
            path.join(__dirname, 'api_endpoints.json'),
            JSON.stringify(endpointData, null, 2)
        );
        console.log(`✅ API endpoints written to api_endpoints.json (${endpoints.length} endpoints)`);
    } catch (error) {
        console.error('❌ Failed to generate API endpoints:', error.message);
    }
}

// ============================================
// Server Startup
// ============================================
let server;
const startServer = async () => {
    await connectDatabase();
    server = app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`🚀 Assiut Robotics Server`);
        console.log('='.repeat(50));
        console.log(`📍 Environment: ${NODE_ENV}`);
        console.log(`🌐 Server: http://localhost:${PORT}`);
        console.log(`💚 Health Check: http://localhost:${PORT}/health`);
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log('='.repeat(50));
    });
};
startServer();

// ============================================
// Graceful Shutdown
// ============================================
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

    if (!server) {
        console.log('✅ No active HTTP server instance');
        process.exit(0);
    }

    server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 Process terminated gracefully');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Do not terminate process on transient DB/network failures in serverless/runtime environments.
});

module.exports = app;
