# Use Node.js LTS version
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose port 5002
EXPOSE 5002

# Start the server in dev mode
CMD ["npm", "run", "dev"]
