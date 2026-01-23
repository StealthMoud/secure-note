# SecureNote

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)

SecureNote is a simple, private way to share notes. It's built with end-to-end encryption principles, 2FA, and proper access controls so you can keep your data safe.

---

## What it does
- **Authentication**: JWT-based login with Google, GitHub, or local accounts.
- **2FA**: Extra security using TOTP (apps like Google Authenticator).
- **Access Control**: Admin and User roles with their own dashboards.
- **Note Sharing**: Share notes with friends (view or edit permissions).
- **Markdown Support**: Take notes using rich markdown.
- **Audit Logs**: Admins can see security events and logs.
- **Docker Ready**: Containers for easy setup.

---

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express.js, Passport.js.
- **Database**: MongoDB (via Mongoose).
- **Security**: Bcrypt, JWT, Speakeasy (TOTP), Helmet.
- **Infrastructure**: Docker & Docker Compose.

---

## Architecture
We keep things clean by separating the UI from the backend logic.

```mermaid
graph TD
    subgraph Frontend ["Frontend (Next.js)"]
        UI["User Interface"]
        Components
        Services["API Fetching"]
        Context["State"]
        
        UI --> Components
        Components --> Context
        Context --> Services
    end

    subgraph Backend ["Backend (Express.js)"]
        API["Routes"]
        Controllers
        Middleware["Security & Auth"]
        Models["Database Models"]
        
        API --> Middleware
        Middleware --> Controllers
        Controllers --> Models
    end

    subgraph Database ["Data"]
        MongoDB[("MongoDB")]
    end
    
    Services -- "JSON API" --> API
    Models -- "Mongoose" --> MongoDB
```

---

## Security
We use a "Verify Everything" approach:
1. **JWT Identity**: Every API hit checks your token and permissions.
2. **Least Privilege**: You only see what you own or what's specifically shared with you.
3. **Optimistic Locking**: We use versioning (`__v`) to prevent data loss if two people edit the same note at once.

---

## Database Schema
Here's how we structure the data.

```mermaid
erDiagram
    USERS ||--o{ NOTES : owns
    USERS ||--o{ SECURITY_LOGS : generates
    USERS ||--o{ FRIENDS : has
    NOTES ||--o{ SHARED_WITH : "shared with"

    USERS {
        ObjectId _id PK
        string username
        string email
        string role
        boolean isTotpEnabled
        string publicKey
    }

    NOTES {
        ObjectId _id PK
        string title
        string content
        boolean encrypted
        ObjectId owner FK
    }

    SHARED_WITH {
        ObjectId user FK
        enum permission "viewer|editor"
        string encryptedTitle
        string encryptedContent
    }

    SECURITY_LOGS {
        ObjectId _id PK
        enum event
        ObjectId user FK
        json details
    }
```

---

## Screenshots

### User Dashboard
| Dashboard | Notes | Friends |
| :---: | :---: | :---: |
| ![](docs/User%20Panel%20%7C%20Dashboard.png) | ![](docs/User%20Panel%20%7C%20Notes.png) | ![](docs/User%20Panel%20%7C%20Friends.png) |

### Admin View
| Overview | Users | Logs |
| :---: | :---: | :---: |
| ![](docs/Admin%20Panel%20%7C%20Overview.png) | ![](docs/Admin%20Panel%20%7C%20Users.png) | ![](docs/Admin%20Panel%20%7C%20Security%20Logs.png) |

---

## Setup Guide

### What you'll need
- **Node.js**: v18 or newer.
- **Docker**: If you want to run everything in containers (easiest).
- **MongoDB**: If you're running the backend manually.

### Installation
1. **Clone it**:
   ```bash
   git clone https://github.com/StealthMoud/secure-note.git
   cd secure-note
   ```

2. **Backend Config**:
   Copy the example env file and fill in your secrets (JWT, OAuth, etc.).
   ```bash
   cp backend/.env.example backend/.env
   # Also copy it to the root if you're using Docker
   cp backend/.env.example .env
   ```

3. **Frontend Config**:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

4. **Install everything**:
   We use NPM workspaces, so one command handles both:
   ```bash
   npm install
   ```

### Running the app

**Using Docker (Recommended)**
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5002`

**Manual Dev Mode**
Run these in separate terminals:
```bash
# Start backend
npm run start:backend

# Start frontend
npm run dev:frontend
```

---

## License
MIT. Check the `LICENSE` file for details.

