# Use Node.js LTS version
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package files first
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose port 3000 for Next.js
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
