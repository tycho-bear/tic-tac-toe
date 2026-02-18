# Multi-stage build for efficiency
# Stage 1: Build the React client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install ALL dependencies (including dev deps like react-scripts)
RUN npm ci

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Setup the server
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install only production dependencies for the server
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy built client from previous stage
COPY --from=client-builder /app/client/build ./client-build

# Expose the port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "index.js"]
