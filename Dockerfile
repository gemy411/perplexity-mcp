# Build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
# Use regular npm install instead of ci, and clean cache afterward
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

# Copy package files and install dependencies
COPY package*.json ./
# Use regular npm install with production flag
RUN npm install  --ignore-scripts --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the application port
# Optionally expose port from environment variable, default to 3000
ARG PORT=3000
EXPOSE ${PORT}

# Start the application
CMD ["node", "build/index.js"]
