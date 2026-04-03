# DevCircle 🚀

> A skill-exchange platform for developers — teach what you know, learn what you want.

## Overview

DevCircle connects developers who want to exchange skills. Post a card saying "I can teach React, I want to learn Docker," get matched with someone who complements your skills, and chat in real time.

Built as a full-stack project to demonstrate end-to-end engineering across authentication, real-time communication, and data visualization.

---

## Features

- **User Auth** — Register and log in with JWT-based authentication and bcrypt password hashing
- **Skill Cards** — Post cards with what you offer and what you want to learn, with tags and search
- **Match System** — Send match requests to other users; accept or decline (Tinder-style logic)
- **Real-Time Chat** — WebSocket-powered chat between matched users via Socket.io
- **Dashboard** — Visualize your activity: matches, messages sent, and trending skill tags

---

## Tech Stack

**Frontend**
- React + TypeScript
- Tailwind CSS
- React Router
- Zustand (global state)
- Socket.io-client
- Recharts

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT + bcryptjs

**Tools**
- Vite
- Vercel (frontend deploy)
- Railway (backend deploy)
- MongoDB Atlas

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Installation

```bash
# Clone the repo
git clone https://github.com/FionaZ-heng/devcircle.git
cd devcircle

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Run Locally

```bash
# Start backend (in /server)
npm run dev

# Start frontend (in /client)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:3001`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/cards` | Get all skill cards (supports search) |
| POST | `/api/cards` | Create a skill card |
| DELETE | `/api/cards/:id` | Delete a card |
| POST | `/api/matches` | Send a match request |
| PUT | `/api/matches/:id` | Accept or decline a match |
| GET | `/api/matches` | Get all my matches |
| GET | `/api/messages/:matchId` | Get chat history |
| GET | `/api/stats/me` | Get personal stats |

---

## Project Structure

```
devcircle/
├── client/               # React frontend
│   └── src/
│       ├── pages/        # Route-level components
│       ├── components/   # Reusable UI components
│       ├── store/        # Zustand global state
│       └── services/     # Axios API client
└── server/               # Node.js backend
    ├── models/           # Mongoose schemas
    ├── routes/           # Express routers
    ├── controllers/      # Business logic
    └── middleware/       # Auth middleware
```

---

## Author

**Fiona (Yutong) Zheng**  
CS Student @ Northeastern University  
[GitHub](https://github.com/FionaZ-heng) · [LinkedIn](https://linkedin.com/in/fiona-zheng-3a6a663a5)