FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Keep all dependencies since server runtime needs some dev dependencies
# (The server imports vite config which requires @vitejs/plugin-react)

# Expose port
EXPOSE 5000

# Start the application
CMD ["npx", "tsx", "server/index.ts"]