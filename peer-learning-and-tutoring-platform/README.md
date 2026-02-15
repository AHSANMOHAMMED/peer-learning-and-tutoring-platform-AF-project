# PeerLearn - Peer Learning and Tutoring Platform

A web-based peer-learning and tutoring platform for school students (grades 6-13) built with the MERN stack. Students help other students with subjects like Math, Science, English, and more via 1-on-1 video sessions.

## 🎯 Project Overview

PeerLearn connects students with qualified peer tutors for personalized learning sessions. Students can browse tutors, book sessions, and engage in real-time learning through video calls, chat, and interactive whiteboards.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, Joi, Multer, Socket.io
- **Frontend:** React (Vite), React Router v6, Axios, Tailwind CSS
- **Authentication:** JWT + bcrypt (no third-party auth)
- **Real-time:** Socket.io for live sessions
- **File Upload:** Multer for profile images and documents

## 📁 Project Structure

```
peer-learning-and-tutoring-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Main pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS/Tailwind
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database and app config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Features

### Core Features
- User authentication (Students, Tutors, Parents, Admins)
- Tutor profiles with expertise and availability
- Session booking and management
- Real-time video calling and chat
- Interactive whiteboard
- Rating and review system

### Advanced Features
- Payment processing
- Analytics dashboards
- Progress tracking
- Email notifications
- Mobile responsive design

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` (copy from `server/.env.example`) and set:

- `MONGO_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/peerlearn`)
- `JWT_SECRET` – A long random string for signing tokens
- `PORT` – Optional; defaults to 5000

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
cp .env.example .env
```

Set in `client/.env`:

- `VITE_API_URL=http://localhost:5000`

```bash
npm run dev
```

App runs at `http://localhost:3000` (or the next free port).

## Environment variables

| Variable       | Where   | Description                          |
|----------------|---------|--------------------------------------|
| `MONGO_URI`    | server  | MongoDB connection string            |
| `JWT_SECRET`   | server  | Secret for JWT signing               |
| `PORT`         | server  | API port (default 5000)               |
| `VITE_API_URL` | client  | Backend API base URL                  |

## Scripts

- **Server:** `npm run dev` (nodemon), `npm start` (node)
- **Client:** `npm run dev`, `npm run build`, `npm run preview`

## First steps

1. Start MongoDB, then start the server and client as above.
2. Open the app, click **Register**, create an account (choose role: student, tutor, parent, or admin).
3. Log in and open **Dashboard**.
4. **Tutors:** Go to **My availability** and add recurring weekly slots (e.g. Mon 14:00–16:00).
5. **Students:** Go to **Browse Tutors**, pick a tutor, choose date/time/duration and book a session.
6. **My Bookings** shows your sessions; tutors can confirm/complete, both can cancel.

## Features

- Auth (register, login, JWT, protected routes)
- Tutor search (filter by subject, grade, min rating)
- Recurring availability (tutors) and bookable slots (30/60 min)
- Bookings (create, confirm, complete, cancel)
- Dashboards and role-based nav

## Next steps

- Session room with Socket.io chat and video/whiteboard placeholders.
- Feedback: rate/review after session, update tutor rating.
