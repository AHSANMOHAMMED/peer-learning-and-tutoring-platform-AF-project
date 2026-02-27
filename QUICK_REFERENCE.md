# PeerLearn Platform - Quick Reference Guide

## 🎯 System Overview

The PeerLearn platform is a comprehensive peer tutoring marketplace built with:
- **Frontend**: React + Vite + Tailwind CSS (MVM pattern)
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt

---

## 📊 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌──────────────────┐                 │
│  │   Views (UI)    │     │ Components       │                 │
│  │ ─────────────── │     │ ──────────────── │                 │
│  │ • LoginView     │     │ • Navbar         │                 │
│  │ • DashboardView │────▶│ • Calendar       │                 │
│  │ • AdminView     │     │ • SessionRoom    │                 │
│  │ • BrowseView    │     │ • ChatBox        │                 │
│  └────────┬────────┘     └──────────────────┘                 │
│           │                                                     │
│           │ consume                                             │
│           ▼                                                     │
│  ┌──────────────────────────────────────┐                     │
│  │   ViewModels (State + Logic)         │                     │
│  │  ────────────────────────────────    │                     │
│  │  • AuthViewModel                     │                     │
│  │  • BookingViewModel                  │                     │
│  │  • TutorViewModel                    │                     │
│  │  • MessageViewModel                  │                     │
│  └────────┬─────────────────────────────┘                     │
│           │                                                     │
│           │ use                                                 │
│           ▼                                                     │
│  ┌──────────────────────────────────────┐                     │
│  │   Services (API Client)              │                     │
│  │  ────────────────────────────────    │                     │
│  │  • authService                       │                     │
│  │  • bookingService                    │                     │
│  │  • tutorService                      │                     │
│  │  • messageService                    │                     │
│  │  (All use Axios + interceptors)      │                     │
│  └────────┬─────────────────────────────┘                     │
│           │                                                     │
│           │ call                                                │
│           ▼                                                     │
│  ┌──────────────────────────────────────┐                     │
│  │   Models (Data Classes)              │                     │
│  │  ────────────────────────────────    │                     │
│  │  • User                              │                     │
│  │  • Tutor                             │                     │
│  │  • Booking                           │                     │
│  └─────────────────────────────────────┘                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
         ║ REST API (Axios)         Socket.io (Real-time)
         ║                          ║
         ▼                          ▼
┌────────────────────────────────────────────────────────────────┐
│              NODE.js + EXPRESS BACKEND                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Routes (/api/auth, /api/bookings, etc.)              │   │
│  │  ├─ Validate input                                     │   │
│  │  └─ Route to appropriate controller                    │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                            │
│                   ▼                                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Controllers (Request Handling)                         │   │
│  │  ├─ authController                                     │   │
│  │  ├─ bookingController                                 │   │
│  │  ├─ tutorController                                   │   │
│  │  ├─ messageController                                 │   │
│  │  └─ [more controllers]                                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                            │
│                   ▼                                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                             │   │
│  │  ├─ authService       (login, logout, tokens)         │   │
│  │  ├─ bookingService    (CRUD, status updates)          │   │
│  │  ├─ tutorService      (profile, filtering)            │   │
│  │  └─ [more services]                                    │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                            │
│                   ▼                                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  MongoDB Models (Database Schemas)                     │   │
│  │  ├─ User         (users collection)                    │   │
│  │  ├─ Tutor        (tutors collection)                   │   │
│  │  ├─ Booking      (bookings collection)                 │   │
│  │  ├─ Message      (messages collection)                 │   │
│  │  ├─ Review       (reviews collection)                  │   │
│  │  └─ [more models]                                      │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                            │
│                   ▼                                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  MongoDB (Database)                                    │   │
│  │  └─ Stores all application data                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Socket.io Server (Real-time Events)                  │   │
│  │  ├─ send_message     → receive_message                │   │
│  │  ├─ booking_updated  → booking_notification           │   │
│  │  ├─ session_started  → session_event                  │   │
│  │  └─ [more events]                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow Example

### Booking Creation Workflow

```
FRONTEND (Student)
│
├─ 1. Fill booking form
│  └─ Date: 2026-02-28
│  └─ Time: 14:00-15:00
│  └─ Subject: Mathematics
│
├─ 2. BookingViewModel.createBooking(data)
│  └─ Validation: Check all fields ✓
│  └─ API Call: POST /api/bookings
│
├─ 3. Axios Interceptor
│  └─ Extract token from localStorage
│  └─ Add header: Authorization: Bearer {jwt}
│  └─ Send request
│
▼
BACKEND (Server)
│
├─ 4. Route Handler (/api/bookings)
│  └─ Extract token from header
│
├─ 5. Auth Middleware
│  └─ Verify JWT signature
│  └─ Extract userId from token
│  └─ Attach user to request
│
├─ 6. BookingController.createBooking()
│  └─ Validate input data
│  └─ Check tutor exists
│  └─ Check tutor availability
│
├─ 7. BookingService.create()
│  └─ Save to MongoDB
│  └─ Calculate payment
│  └─ Create booking object
│
├─ 8. Socket.io Event
│  └─ Emit "booking_created" to tutor's room
│
├─ 9. Response
│  └─ Return { success: true, data: booking }
│
▼
FRONTEND (Student)
│
├─ 10. Response Handler
│  └─ Update BookingViewModel state
│  └─ Show toast: "Booking created!"
│  └─ Redirect to /bookings
│
▼
FRONTEND (Tutor) - Real-time
│
├─ 11. Socket.io Event Received
│  └─ Socket event: "booking_created"
│  └─ Update TutorViewModel
│  └─ Show notification
│  └─ Tutor dashboard refreshes automatically
```

---

## 🔑 Key Data Structures

### User Object
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  username: "john_doe",
  email: "john@example.com",
  role: "student",  // student | tutor | parent | admin
  profile: {
    firstName: "John",
    lastName: "Doe",
    grade: 10,
    school: "Central High",
    phone: "+1234567890",
    avatar: "https://...",
    bio: "Chemistry enthusiast"
  },
  isActive: true,
  emailVerified: false,
  lastLogin: "2026-02-27T10:30:00Z",
  createdAt: "2026-01-15T08:00:00Z"
}
```

### Booking Object
```javascript
{
  _id: "507f1f77bcf86cd799439012",
  studentId: "507f1f77bcf86cd799439011",
  tutorId: "507f1f77bcf86cd799439013",
  subject: "Mathematics",
  date: "2026-02-28",
  startTime: "14:00",
  endTime: "15:00",
  duration: 60,
  status: "confirmed",  // pending | confirmed | completed | cancelled
  payment: {
    amount: 50,
    currency: "USD",
    status: "paid",
    transactionId: "stripe_123"
  },
  session: {
    roomId: "room_123",
    joinUrl: "https://zoom.us/...",
    recordingUrl: "https://..."
  },
  feedback: {
    rating: 5,
    comment: "Excellent tutor!"
  },
  createdAt: "2026-02-27T15:00:00Z"
}
```

---

## 🛡️ Authentication Flow

```
┌─────────────────────────────────────────┐
│  1. User Registration                   │
│  ├─ POST /api/auth/register             │
│  ├─ Backend: Hash password + Save       │
│  └─ Generate JWT: {userId, exp}         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. Token Storage                       │
│  ├─ Save token to localStorage          │
│  ├─ localStorage.setItem('token', jwt)  │
│  └─ Set user state in ViewModel         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. Protected API Calls                 │
│  ├─ GET token from localStorage         │
│  ├─ Axios interceptor adds header       │
│  ├─ Authorization: Bearer {token}       │
│  └─ Send request                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. Server Verification                 │
│  ├─ Auth middleware extracts token      │
│  ├─ Verify JWT signature                │
│  ├─ Decode token → get userId           │
│  ├─ Fetch user from DB                  │
│  └─ Continue if valid, reject if not    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. Token Expiration                    │
│  ├─ Token expires after 7 days          │
│  ├─ If expired: 401 Unauthorized        │
│  ├─ Clear localStorage                  │
│  └─ Redirect to login                   │
└─────────────────────────────────────────┘
```

---

## 📡 API Response Format

### Success Response
```javascript
{
  success: true,
  data: { /* actual data */ },
  message: "Operation successful"
}
```

### Error Response (400 Bad Request)
```javascript
{
  success: false,
  message: "Validation failed",
  errors: [
    { field: "email", message: "Invalid email" },
    { field: "password", message: "Too short" }
  ]
}
```

### Error Response (401 Unauthorized)
```javascript
{
  success: false,
  message: "Invalid credentials"
}
```

### Error Response (403 Forbidden)
```javascript
{
  success: false,
  message: "Access denied. Admin privileges required"
}
```

---

## 🎭 User Roles & Permissions

### Student
```javascript
Router.get('/dashboard')        // Own dashboard ✓
Router.get('/tutors')           // Browse tutors ✓
Router.post('/bookings')        // Create booking ✓
Router.get('/bookings')         // View own bookings ✓
Router.put('/bookings/:id')     // Cancel own booking ✓
Router.post('/reviews')         // Rate tutor ✓
Router.delete('/reviews/:id')   // Delete own review ✓
Router.get('/profile')          // View own profile ✓
Router.put('/profile')          // Update own profile ✓
```

### Tutor
```javascript
Router.put('/profile')          // Update profile ✓
Router.post('/subjects')        // Add subjects ✓
Router.put('/availability')     // Set availability ✓
Router.get('/bookings')         // View bookings ✓
Router.put('/bookings/:id')     // Accept/reject booking ✓
Router.post('/materials')       // Upload materials ✓
Router.get('/earnings')         // View earnings ✓
```

### Admin
```javascript
Router.get('/users')            // List all users ✓
Router.put('/users/:id')        // Suspend/activate ✓
Router.delete('/users/:id')     // Delete user ✓
Router.get('/reports')          // View reported content ✓
Router.put('/reports/:id')      // Review reports ✓
Router.get('/analytics')        // Platform analytics ✓
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Check localStorage, re-login |
| 403 Forbidden | Wrong role | Login with correct role |
| 404 Not Found | Wrong endpoint | Check API route |
| 500 Server Error | Backend crash | Check server logs |
| CORS Error | Domain mismatch | Update CORS in backend |
| Token expired | Auto-logout after 7 days | Re-login |

---

## 📚 File Quick Reference

### Most Important Files

| File | Purpose |
|------|---------|
| `/client/src/App.jsx` | Main routing logic |
| `/client/src/viewmodels/AuthViewModel.js` | Auth state mgmt |
| `/client/src/services/api.js` | API client config |
| `/server/index.js` | Backend entry point |
| `/server/models/User.js` | User database schema |
| `/server/controllers/authController.js` | Auth logic |
| `/server/middleware/auth.js` | JWT verification |

---

## 🚀 Getting Started (Development)

```bash
# Terminal 1: Start Backend
cd server
npm install
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend
cd client
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 📝 Key Takeaways

1. **MVM Pattern**: Clear separation between UI (Views), Business Logic (ViewModels), and Data (Models)
2. **JWT Authentication**: Stateless auth with token-based system
3. **Real-time Features**: Socket.io for instant notifications and messages
4. **API-Driven**: Clean REST API with consistent response format
5. **Role-Based Access**: Different capabilities per user role
6. **Database-First**: MongoDB with well-structured schemas
7. **Error Handling**: Proper error responses and user feedback

---

**Created**: February 27, 2026
