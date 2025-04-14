# 🔐 SecureNote
A robust, full-stack web application designed for **secure note-sharing and access control**. Built with a strong focus on security, encryption, two-factor authentication, and user/admin access segregation.

---

## 🚀 Overview

SecureNote enables users to **create, share, and manage encrypted notes** in a privacy-first environment. It integrates **JWT authentication**, **TOTP-based two-factor authentication**, and **role-based access control** to ensure security and accountability at every level.

---

## 🧱 Tech Stack

| Layer      | Tech Used                                  |
|------------|---------------------------------------------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS             |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose       |
| **Security** | JWT, TOTP (Two-Factor Auth), Passport.js     |
| **Containerization** | Docker, Docker Compose                     |
---

## 📁 Project Structure

```
secure-note/
├── backend/         # Node.js API
│   ├── config/      # DB, Passport configs
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth, Verification
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API endpoints
│   ├── utils/       # Encryption, logging
│   └── server.js
│
├── frontend/        # Next.js App
│   ├── app/         # Pages (Admin, User)
│   ├── context/     # React Context Providers
│   ├── src/         # Reusable components, services
│   ├── public/      # Static assets
│   └── config/      # Tailwind, ESLint, etc.
│
├── docs/            # UI screenshots
├── docker-compose.yml
└── README.md
```

---

## 📸 Interface Previews

### 👤 User Dashboard

| Dashboard | Notes | Friends | Notifications | Profile | Account Settings |
|----------|-------|---------|---------------|---------|------------------|
| ![](docs/User%20Panel%20%7C%20Dashboard.png) | ![](docs/User%20Panel%20%7C%20Notes.png) | ![](docs/User%20Panel%20%7C%20Friends.png) | ![](docs/User%20Panel%20%7C%20Notifications.png) | ![](docs/User%20Panel%20%7C%20Profile.png) | ![](docs/User%20Panel%20%7C%20Account%20Settigs.png) |

### 🛡️ Admin Panel

| Overview | Users | Security Logs |
|----------|-------|----------------|
| ![](docs/Admin%20Panel%20%7C%20Overview.png) | ![](docs/Admin%20Panel%20%7C%20Users.png) | ![](docs/Admin%20Panel%20%7C%20Security%20Logs.png) |

---

## ⚙️ Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org)
- [Docker](https://www.docker.com/)
- [MongoDB (Dockerized)] or local instance

---

### 🧪 Local Setup (with Docker)

```bash
git clone git@github.com:StealthMoud/secure-note.git
cd secure-note
docker-compose up --build
```

Frontend will be accessible at: [http://localhost:3000](http://localhost:3000)  
Backend API available at: [http://localhost:5000/api](http://localhost:5000/api)

---

### 🔐 Environment Variables

#### backend/.env

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/securenote
JWT_SECRET=your_jwt_secret
TOTP_SECRET=your_totp_secret
```

#### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔒 Key Features

- ✅ Secure user authentication (JWT + TOTP)
- ✉️ Email verification & password reset
- 🗂️ Note creation & encryption
- 🤝 Friend & note sharing system
- 🛡️ Admin dashboard for user & log management
- 🧾 Real-time security event logging
- 🌐 Fully Dockerized setup

---

## 📌 Roadmap

- [ ] File uploads to notes
- [ ] Note expiry and revocation
- [ ] Export/import notes feature
- [ ] Role-based permission customization
- [ ] Enhanced audit trail & analytics

---

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
