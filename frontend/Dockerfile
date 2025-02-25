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

# Expose port for Next.js
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
