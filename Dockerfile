# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy node_modules and built code from builder
COPY --from=builder /usr/src/app ./

# Setup non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "index.js"]
