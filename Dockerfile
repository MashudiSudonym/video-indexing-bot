# Build stage
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built dist folder from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (if needed for health checks)
EXPOSE 3000

# Start the bot
CMD ["node", "dist/index.js"]