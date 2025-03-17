# Use Node.js 18 on Debian
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start in dev mode
CMD ["npm", "run", "dev"]
