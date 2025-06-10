# Build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --ignore-scripts && \
    npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install ffmpeg and create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set the working directory
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --ignore-scripts --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage, set ownership
COPY --chown=nodejs:nodejs --from=builder /app/build ./build

# Set environment variables for production and port
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER nodejs

EXPOSE $PORT

# Start the application
CMD ["node", "build/index.js"]
