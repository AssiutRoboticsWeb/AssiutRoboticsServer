const { config, validateEnvironment } = require('./config/environment');
const { connectDB } = require('./config/database');
const { healthCheck, lightHealthCheck } = require('./middleware/healthCheck');
const { cacheStats, clearCache } = require('./middleware/cache');

// Validate environment variables
validateEnvironment();

const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routers
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

// Import utilities
const httpStatusText = require('./utils/httpStatusText');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine
app.set('view engine', 'ejs');

// Health check routes (before other routes for load balancer health checks)
app.get("/health", healthCheck);
app.get("/health/light", lightHealthCheck);

// Cache management routes (admin only)
app.get("/cache/stats", cacheStats);
app.delete("/cache/clear", clearCache);

// API Routes
app.use("/members", memberRouter);
app.use("/blogs", blogRouter);
app.use("/components", componentRouter);
app.use("/lap-dates", lapDateRouter);
app.use("/visits", visitRouter);     
app.use("/announcements", announcementRouter);
app.use("/meetings", meetingRouter);
app.use("/guests", guestRouter);
app.use("/webhooks", webhookRoutes);
app.use("/tracks", trackRouter);
app.use("/courses", courseRouter);
app.use("/applicants", applicantRouter);
app.use("/tracksys", tracksysRouter);

// Default route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Assiut Robotics Server API",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        documentation: "/health",
        status: "operational",
        features: [
            "Health monitoring",
            "Rate limiting",
            "Input validation",
            "Caching system",
            "Comprehensive logging"
        ]
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const statusText = err.statusText || httpStatusText.ERROR;
    
    console.error(`[Error ${statusCode}] ${err.message}`, {
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    res.status(statusCode).json({
        success: false,
        statusText,
        message: statusCode === 500 ? "Internal Server Error" : err.message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await require('./config/database').disconnectDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await require('./config/database').disconnectDB();
    process.exit(0);
});

// Start server
const server = app.listen(config.port, () => {
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`📅 Registration deadline: ${config.app.registrationDeadline}`);
    console.log(`🔍 Health check: http://localhost:${config.port}/health`);
    console.log(`⚡ Light health check: http://localhost:${config.port}/health/light`);
    console.log(`💾 Cache stats: http://localhost:${config.port}/cache/stats`);
    console.log(`🧹 Clear cache: DELETE http://localhost:${config.port}/cache/clear`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    
    const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;
    
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

module.exports = app;


