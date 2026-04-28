# Multi-stage Dockerfile for Peer Learning Platform

# ==========================================
# Stage 1: Build Client (Frontend)
# ==========================================
FROM node:18-alpine AS client-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build production bundle
RUN npm run build

# ==========================================
# Stage 2: Build Server (Backend)
# ==========================================
FROM node:18-alpine AS server-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# ==========================================
# Stage 3: Production Image
# ==========================================
FROM node:18-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy built client from builder to backend's public directory
COPY --from=client-builder /app/frontend/dist ./backend/public

# Copy server from builder
COPY --from=server-builder /app/backend ./backend

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
