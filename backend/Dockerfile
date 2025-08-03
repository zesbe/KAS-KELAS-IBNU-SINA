# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory - using backend as working dir
WORKDIR /backend

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]