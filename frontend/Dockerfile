# Build stage
FROM node:18-alpine AS builder

# Set working directory - using frontend as working dir
WORKDIR /frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /frontend

# Install serve globally
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /frontend/build ./build

# Copy package.json for serve script
COPY package.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]