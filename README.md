# SecureNote

Hey! Welcome to **SecureNote**. This is a project I've been working on to make a truly private and secure space for notes. It's built with a focus on Zero Trust principles, meaning we don't just "trust" the system—we verify every single step.

Whether you're looking for a personal vault for your ideas or a secure way to share notes with a small circle, SecureNote has you covered with end-to-end encryption principles and a clean, modern interface.

---

## What's inside?

I've packed this with features that actually matter for security and usability:

*   **Zero Trust Auth**: Login with username/password or use your Google/GitHub account.
*   **Extra Protection**: Built-in 2FA (TOTP) because a password just isn't enough these days.
*   **Encrypted Sharing**: Share notes with friends with granular permissions (Viewer or Editor).
*   **Admin Tools**: Dedicated panel for managing users, checking security logs, and sending system-wide broadcasts.
*   **Modern Reorg**: The project is strictly organized into `src` folders for both frontend and backend, making it snappy and easy to maintain.
*   **Docker Ready**: Comes with a full Docker setup so you don't have to worry about manual environment config.

---

## Tech Stack

I kept things modern and stable:
- **Frontend**: Next.js, React, Tailwind CSS (it's fast and looks great).
- **Backend**: Node.js, Express (the backbone of the API).
- **Database**: MongoDB (clean and flexible for note storage).
- **Security Logic**: JWT for auth, Bcrypt for hashing, and AES-based logic for the secure stuff.

---

## How to get started

I've made the setup as simple as possible using NPM workspaces.

### 1. Clone the repo
```bash
git clone https://github.com/StealthMoud/secure-note.git
cd secure-note
```

### 2. Install everything
Run this in the root folder to install dependencies for both the frontend and the backend at once:
```bash
npm install
```

### 3. Set up your environment
You'll need a couple of `.env` files to get things running. I've included examples to make it easy.

- **Backend**: 
  ```bash
  cp backend/.env.example backend/.env
  ```
- **Frontend**: 
  ```bash
  # Just create a basic one if it's not there, usually points to the backend URL
  echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > frontend/.env.local
  ```

*Make sure to open `backend/.env` and add your MongoDB URI, JWT secret, and any OAuth keys you want to use.*

### 4. Run the project

#### The easy way (Docker)
If you have Docker installed, just run:
```bash
docker-compose up --build
```
This handles the database, the backend, and the frontend for you.

#### The dev way (Manual)
If you want to run things manually while developing:
- Start the API: `npm run start:backend`
- Start the Web UI: `npm run dev:frontend`

---

## Pro Tips & Useful Scripts

I've included some helper scripts in the `scripts/db` folder to help you manage the vault:

- **Create a Superadmin**: `node scripts/db/create-superadmin.js` (quickly set up your first admin account).
- **Clear the DB**: `node scripts/db/db-clear.js` (starts you with a fresh slate).
- **Set User Roles**: `node scripts/db/set-role.js <email> <role>` (easily promote yourself or others).

---

## A Note on Privacy

This project was built with the idea that your data belongs to you. No one—not even the server owner—should be able to peek into your private notes if you've set them up correctly with our encryption flow.

Feel free to fork this, play around with the code, or open a PR if you have ideas on how to make it even more secure!

---

## License
MIT. Use it, learn from it, build something cool.

