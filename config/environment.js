require('dotenv').config();

const requiredEnvVars = [
  'MONGOURL',
  'SECRET',
  'PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

const config = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGOURL,
  jwtSecret: process.env.SECRET,
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  },
  app: {
    baseUrl: process.env.BASE_URL || 'https://assiut-robotics-zeta.vercel.app',
    registrationDeadline: process.env.REGISTRATION_DEADLINE || '2025-09-27',
  },
};

module.exports = { config, validateEnvironment };
