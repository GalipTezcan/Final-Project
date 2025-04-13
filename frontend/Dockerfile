# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

# Copy configuration files
COPY tsconfig.json ./
COPY public/ ./public/

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 