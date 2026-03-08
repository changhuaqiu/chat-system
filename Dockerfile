# Multi-stage build for React frontend and Node.js backend

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Node.js Backend
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/
# Copy built frontend assets to backend's public directory (served by Fastify or Nginx)
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Install Python for potential worker needs (optional, keep light)
# RUN apk add --no-cache python3 py3-pip

# Environment setup
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start command
WORKDIR /app/backend
CMD ["node", "src/server.js"]
