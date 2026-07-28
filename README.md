# Assiut Robotics Team Server

The backend API for the Assiut Robotics Team website, completely overhauled for scalability, maintainability, and enterprise-grade performance. Built with Node.js, Express, and MongoDB.

## 🚀 Architecture Overview

This project strictly follows **Clean Architecture** patterns to ensure separation of concerns:

- **Routes (`/routes`)**: API endpoint definitions and middleware composition (Auth, Validation).
- **Controllers (`/controller`)**: Request/Response handling. Controllers do NOT contain business logic.
- **Services (`/services`)**: Core business logic, database queries, and data transformation.
- **Models (`/models`)**: Mongoose schemas representing the database entities.
- **Middleware (`/middleware`)**: Cross-cutting concerns (Error Handling, JWT Auth, Role Checking, Multer Uploads).

## 🐳 Deployment (Docker & CI/CD)

The application is fully containerized and includes a CI/CD pipeline.

### Local Development with Docker Compose

1. Clone the repository and navigate to the server directory.
2. Ensure you have Docker and Docker Compose installed.
3. Run the following command to start both the Node.js server and a MongoDB instance:

```bash
docker-compose up --build
```

*The server will be available at `http://localhost:4000`*

### CI/CD Pipeline

We use **GitHub Actions** (`.github/workflows/main.yml`) for continuous integration.
On every push or pull request to the `main` branch, the pipeline will:

1. Setup Node.js (v18.x)
2. Install dependencies
3. Build the Docker Image
4. Run automated tests (if configured)

## 🛠️ Prerequisites (Manual Setup)

- Node.js (v18+)
- MongoDB (v6.0+)
- Cloudinary Account (for image uploads)
- Google Cloud Service Account (for Drive integration)

## 📦 Installation (Manual Setup)

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Environment Setup**
    Copy `.env.example` to `.env` and fill in the values:

    ```bash
    cp .env.example .env
    ```

    > **Strict Requirement**: You MUST provide all Cloudinary and Google credentials in `.env`. The project no longer supports hardcoded keys for security reasons.

3. **Run Development Server**

    ```bash
    npm run dev
    ```

## 📚 API Documentation & Endpoints

- Base URL: `http://localhost:4000`
- API Status: `GET /`
- Health Check: `GET /health` (Returns uptime, memory usage, and DB status)

### Core Modules

- **Auth**: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- **Dashboard**: `/api/dashboard/leader`, `/api/dashboard/committee`
- **Search**: `/api/search?q=query`
- **Members**: `/api/members` (Supports pagination and filtering)
- **Components**: `/api/components` (Inventory and borrow requests)
- **Tasks**: `/api/tasks` (Task assignments and statuses)

## 🔒 Security Measures

- **JWT Dual Tokens**: Short-lived Access Tokens (15m) + HTTP-Only Refresh Tokens (7d).
- **Helmet**: Secures HTTP headers.
- **Express Rate Limit**: Limits requests to 100/15m per IP to prevent brute-force and DDoS attacks.
- **Mongo Sanitize & XSS Clean**: Prevents NoSQL injection and Cross-Site Scripting.
- **CORS**: Strictly configured for allowed frontend origins.
