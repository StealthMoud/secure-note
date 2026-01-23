# Installation Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Docker](https://www.docker.com/) (optional, for containerized setup)
- [MongoDB](https://www.mongodb.com/) (if running locally without Docker)

## Quick Start with Docker

1. **Clone the repository**:
   ```bash
   git clone https://github.com/StealthMoud/secure-note.git
   cd secure-note
   ```

2. **Set up environment variables**:
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Configure secrets**:
   Edit `backend/.env` and update:
   - `JWT_SECRET` - Your JWT secret key
   - `MONGO_URI` - MongoDB connection string
   - OAuth credentials (if using Google/GitHub login)

4. **Start with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Manual Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start the frontend**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## Database Setup

### Using Docker

MongoDB is automatically set up when using `docker-compose up`.

### Manual MongoDB Setup

1. **Install MongoDB** following the [official guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data
   ```

3. **Update connection string** in `backend/.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/securenote
   ```

## Initial Admin User

To create an admin user, use the provided script:

```bash
cd scripts/db
node set-role.js
```

## Verification

1. **Check backend health**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Access frontend**:
   Open http://localhost:3000 in your browser

3. **Run tests**:
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

## Troubleshooting

### Port Already in Use

If ports 3000 or 5000 are already in use:
- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check connection string in `backend/.env`
- Verify network connectivity

### Docker Issues

- Ensure Docker daemon is running
- Try `docker-compose down` then `docker-compose up --build`
- Check logs: `docker-compose logs`
