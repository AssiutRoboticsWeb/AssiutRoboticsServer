const mongoose = require('mongoose');
const { config } = require('../config/environment');

/**
 * Comprehensive health check middleware
 * Provides detailed system status including database, memory, and uptime
 */
const healthCheck = async (req, res) => {
    try {
        const startTime = Date.now();
        
        // System information
        const systemInfo = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        };
        
        // Database health check
        let dbStatus = 'disconnected';
        let dbResponseTime = 0;
        
        if (mongoose.connection.readyState === 1) {
            const dbStart = Date.now();
            try {
                await mongoose.connection.db.admin().ping();
                dbResponseTime = Date.now() - dbStart;
                dbStatus = 'connected';
            } catch (error) {
                dbStatus = 'error';
                console.error('Database ping failed:', error.message);
            }
        }
        
        // Environment check
        const envStatus = {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: config.port,
            database: dbStatus,
            smtp: !!(config.smtp.user && config.smtp.pass),
            cloudinary: !!(config.cloudinary.cloudName && config.cloudinary.apiKey),
            jwt: !!config.jwtSecret
        };
        
        // Overall health status
        const isHealthy = dbStatus === 'connected' && 
                         envStatus.smtp && 
                         envStatus.cloudinary && 
                         envStatus.jwt;
        
        const responseTime = Date.now() - startTime;
        
        const healthData = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            version: '2.0.0',
            environment: envStatus,
            database: {
                status: dbStatus,
                responseTime: `${dbResponseTime}ms`,
                connectionString: config.mongoUrl ? 'Configured' : 'Missing'
            },
            system: systemInfo,
            checks: {
                database: dbStatus === 'connected',
                smtp: envStatus.smtp,
                cloudinary: envStatus.cloudinary,
                jwt: envStatus.jwt
            }
        };
        
        const statusCode = isHealthy ? 200 : 503;
        
        res.status(statusCode).json(healthData);
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
        });
    }
};

/**
 * Lightweight health check for load balancers
 */
const lightHealthCheck = (req, res) => {
    const isHealthy = mongoose.connection.readyState === 1;
    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json({
        status: isHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    healthCheck,
    lightHealthCheck
};
