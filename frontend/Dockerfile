# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Set environment variables before build
ENV NODE_ENV=production
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy source code and build
COPY . .
RUN echo "REACT_APP_API_URL=$REACT_APP_API_URL" > .env
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]