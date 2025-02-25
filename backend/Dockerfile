# Use Node.js LTS version
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy entire project
COPY . .

# Expose port for Node.js
EXPOSE 5000

# Start the server using nodemon for hot-reloading
CMD ["npx", "nodemon", "server.js"]
