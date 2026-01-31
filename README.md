# Assiut Robotics Server

The backend API for the Assiut Robotics Team website. Built with Node.js, Express, and MongoDB.

## Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account (for image uploads)
- Google Cloud Service Account (for Drive integration)

## Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in the values:
    ```bash
    cp .env.example .env
    ```
    
    > **Strict Requirement**: You MUST provide all Cloudinary and Google credentials in `.env`. The project no longer supports hardcoded keys for security reasons.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## API Documentation
The API runs on port 3000 by default.
- Base URL: `http://localhost:3000`
- API Status: `GET /`

## Security
This server is protected with `helmet` and `express-rate-limit`.
- Rate Limit: 100 requests per 15 minutes per IP.
