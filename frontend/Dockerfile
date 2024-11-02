# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Set environment variables before build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
