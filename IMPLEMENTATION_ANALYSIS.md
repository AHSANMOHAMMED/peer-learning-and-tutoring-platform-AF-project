# PeerLearn Platform - Complete Implementation Analysis

## Executive Summary

The **PeerLearn** (Peer-Learning and Tutoring Platform) is a full-stack web application implementing the **MVM (Model-View-ViewModel)** architecture pattern. It's a marketplace connecting students with tutors, featuring real-time messaging, booking management, progress tracking, and content moderation.

---

## 🏗️ Architecture Overview

### Architecture Pattern: MVM (Model-View-ViewModel)

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
├─────────────────────────────────────────────────────────────┤
│  Views (UI)  ←→  ViewModels (State/Logic)  ←→  Models (Data)│
│                                                               │
│  └─ Views consume ViewModels                                 │
│  └─ ViewModels manage state & business logic                 │
│  └─ Models define data structures                            │
│  └─ Services handle API communication                        │
└─────────────────────────────────────────────────────────────┘
                         ↕ (REST API)
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                │
├─────────────────────────────────────────────────────────────┤
│  Routes → Controllers → Services → Models (MongoDB)          │
│                                                               │
│  └─ Routes: Request routing & validation                     │
│  └─ Controllers: Business logic & request handling           │
│  └─ Services: Reusable business logic                        │
│  └─ Models: MongoDB schemas & validation                     │
└─────────────────────────────────────────────────────────────┘
        ↕ (Socket.io for real-time features)
┌──────────────────────────────────────┐
│  Real-time Features (Notifications,  │
│  Messages, Session Updates)          │
└──────────────────────────────────────┘
```

---

## 📱 FRONTEND IMPLEMENTATION

### Directory Structure

```
client/
├── src/
│   ├── models/              # Data structures & entities
│   │   ├── User.js         # User entity with role checks
│   │   ├── Tutor.js        # Tutor profile & subjects
│   │   ├── Booking.js      # Booking lifecycle
│   │   ├── Message.js      # Chat messages
│   │   ├── Review.js       # Ratings & reviews
│   │   └── Notification.js # Notification entity
│   │
│   ├── viewmodels/         # State & business logic
│   │   ├── AuthViewModel.js        # Login/Register/Logout
│   │   ├── TutorViewModel.js       # Browse/Search tutors
│   │   ├── BookingViewModel.js     # Create/Manage bookings
│   │   ├── MessageViewModel.js     # Chat functionality
│   │   ├── ReviewViewModel.js      # Ratings & feedback
│   │   ├── NotificationViewModel.js # Notifications
│   │   ├── SessionViewModel.js     # Live sessions
│   │   └── MaterialViewModel.js    # Study materials
│   │
│   ├── views/              # UI Pages
│   │   ├── LoginView.jsx           # Authentication
│   │   ├── RegisterView.jsx        # User signup
│   │   ├── StudentDashboard.jsx    # Student interface
│   │   ├── TutorDashboard.jsx      # Tutor interface
│   │   ├── AdminDashboard.jsx      # Admin panel
│   │   ├── ParentDashboard.jsx     # Parent monitoring
│   │   ├── BrowseTutors.jsx        # Tutor marketplace
│   │   └── [Future Views]
│   │
│   ├── components/         # Reusable Components
│   │   ├── EnhancedCalendar.jsx    # Booking calendar
│   │   ├── SessionRoom.jsx         # Video session
│   │   ├── ResourceLibrary.jsx     # Learning materials
│   │   ├── ModeratorDashboard.jsx  # Content moderation
│   │   └── common/
│   │       ├── Navbar.jsx          # Top navigation
│   │       └── Footer.jsx          # Footer
│   │
│   ├── services/           # API Integration
│   │   ├── api.js                  # Axios config + interceptors
│   │   ├── authService.js          # Auth API calls
│   │   ├── tutorService.js         # Tutor API calls
│   │   ├── bookingService.js       # Booking API calls
│   │   ├── messageService.js       # Chat API calls
│   │   ├── reviewService.js        # Review API calls
│   │   ├── notificationService.js  # Notification API
│   │   ├── sessionService.js       # Session API
│   │   ├── materialService.js      # Materials API
│   │   └── userService.js          # User API
│   │
│   ├── contexts/           # Global State
│   │   └── AuthContext.jsx         # Auth state provider
│   │
│   ├── styles/             # Styling
│   │   └── globals.css             # Tailwind + globals
│   │
│   ├── pages/              # Static pages
│   │   └── Home.jsx                # Landing page
│   │
│   ├── App.jsx             # Main app + routing
│   └── main.jsx            # Entry point
│
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind themes
```

### Key Frontend Patterns

#### 1. **MVM State Management Pattern**

```javascript
// ViewModel with Observer Pattern
class AuthViewModel {
  constructor() {
    this.user = null;
    this.isLoading = false;
    this.error = null;
    this.listeners = [];  // Observer pattern
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  async login(credentials) {
    this.setLoading(true);
    try {
      const response = await authService.login(credentials);
      this.setUser(response.data.user);
      return { success: true };
    } catch (error) {
      this.setError(error.message);
      return { success: false };
    }
  }
}

// Hook for React integration
export function useAuthViewModel() {
  const [state, setState] = useState(authViewModel.getState());

  useEffect(() => {
    const unsubscribe = authViewModel.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authViewModel.login.bind(authViewModel),
    logout: authViewModel.logout.bind(authViewModel),
    // ... other methods
  };
}
```

#### 2. **API Service with Interceptors**

```javascript
// Axios instance with automatic token injection
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 3. **Protected Routes**

```javascript
// Role-based access control
<RoleProtectedRoute 
  allowedRoles={['admin', 'moderator']}
>
  <AdminDashboard />
</RoleProtectedRoute>
```

#### 4. **Data Models**

```javascript
// User Model
export class User {
  constructor(data = {}) {
    this.id = data._id || '';
    this.email = data.email || '';
    this.role = data.role || 'student'; // student|tutor|parent|admin
    this.profile = {
      firstName: data.profile?.firstName || '',
      lastName: data.profile?.lastName || '',
      avatar: data.profile?.avatar || '',
      // ...
    };
  }

  get fullName() {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  get isStudent() { return this.role === 'student'; }
  get isTutor() { return this.role === 'tutor'; }
}
```

### Frontend Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool (fast dev server) |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client |
| **Tailwind CSS** | Styling |
| **React Hot Toast** | Notifications |
| **Socket.io Client** | Real-time features |

---

## 🔧 BACKEND IMPLEMENTATION

### Directory Structure

```
server/
├── index.js                # Express app setup + Socket.io
│
├── config/
│   └── db.js              # MongoDB connection
│
├── models/                # MongoDB Schemas
│   ├── User.js            # User with password hashing
│   ├── Tutor.js           # Tutor profile + subjects
│   ├── Booking.js         # Session bookings + payments
│   ├── Message.js         # Chat messages
│   ├── Review.js          # Ratings & reviews
│   ├── Notification.js    # User notifications
│   ├── Material.js        # Study materials
│   ├── SessionFeedback.js # Post-session feedback
│   ├── Report.js          # Abuse reports
│   ├── ModeratorAction.js # Moderation logs
│   └── [More models...]
│
├── controllers/           # Business Logic
│   ├── authController.js        # Registration, Login, Password reset
│   ├── userController.js        # User profile management
│   ├── tutorController.js       # Tutor profile & subjects
│   ├── bookingController.js     # Booking lifecycle
│   ├── messageController.js     # Chat messages
│   ├── reviewController.js      # Ratings & reviews
│   ├── notificationController.js# Notifications
│   ├── sessionController.js     # Video sessions
│   ├── materialController.js    # Study materials
│   ├── moderationController.js  # Content moderation
│   └── [More controllers...]
│
├── services/              # Reusable Services
│   ├── authService.js          # Auth logic (token generation, etc.)
│   ├── bookingService.js       # Booking operations
│   ├── notificationService.js  # Notification logic
│   ├── tutorService.js         # Tutor operations
│   ├── videoService.js         # Video session management
│   └── [More services...]
│
├── routes/                # API Endpoints
│   ├── auth.js            # /api/auth (login, register, etc.)
│   ├── users.js           # /api/users (profile, etc.)
│   ├── tutors.js          # /api/tutors (browse, filter, etc.)
│   ├── bookings.js        # /api/bookings (CRUD operations)
│   ├── messages.js        # /api/messages (chat)
│   ├── reviews.js         # /api/reviews (ratings)
│   ├── notifications.js   # /api/notifications
│   ├── sessions.js        # /api/sessions (video sessions)
│   ├── materials.js       # /api/materials (content)
│   ├── moderation.js      # /api/moderation (admin)
│   └── [More routes...]
│
├── middleware/            # Request Processing
│   ├── auth.js            # JWT authentication + role authorization
│   └── validate.js        # Input validation
│
└── package.json           # Dependencies
```

### Key Backend Patterns

#### 1. **Database Models with Validation**

```javascript
// User Model with Password Hashing
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'parent', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    // ...
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

// Pre-save hook: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Booking Model with Complex Structure
const bookingSchema = new mongoose.Schema({
  studentId: { type: ObjectId, ref: 'User', required: true },
  tutorId: { type: ObjectId, ref: 'Tutor', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: Number,
    status: String, // 'pending', 'paid', 'refunded'
    stripePaymentIntentId: String
  },
  session: {
    roomId: String,
    joinUrl: String,
    recordingUrl: String
  }
}, { timestamps: true });
```

#### 2. **Authentication & Authorization**

```javascript
// JWT Token Generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Middleware: Authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware: Role-based Authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

#### 3. **Service Layer Example**

```javascript
// AuthService: Reusable authentication logic
class AuthService {
  static async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    const token = AuthService.generateToken(user._id);
    return {
      user: user.toPublicJSON(),
      token
    };
  }

  static async registerUser(userData) {
    if (await User.findOne({ email: userData.email })) {
      throw new Error('User already exists');
    }

    const user = new User(userData);
    await user.save();

    const token = AuthService.generateToken(user._id);
    return { user: user.toPublicJSON(), token };
  }
}
```

#### 4. **Real-time Features with Socket.io**

```javascript
// Socket.io Server Setup
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room
  socket.on('join', (userId) => {
    socket.join(userId); // Join private room
  });

  // Handle new message
  socket.on('send_message', (data) => {
    io.to(data.recipientId).emit('receive_message', data);
  });

  // Real-time booking update
  socket.on('booking_updated', (bookingData) => {
    socket.to(bookingData.studentId).emit('booking_update', bookingData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

#### 5. **API Validation**

```javascript
// Route with validation
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }),
  body('username').matches(/^[a-zA-Z0-9_]+$/),
  body('profile.firstName').notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process registration
});
```

### Backend Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **Express** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM (Object-Document Mapper) |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Socket.io** | Real-time features |
| **Express-validator** | Input validation |

---

## 🗄️ DATABASE SCHEMA

### User Collections

#### 1. **User (Core Identity)**
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed with bcrypt),
  role: 'student' | 'tutor' | 'parent' | 'admin',
  profile: {
    firstName: String (required),
    lastName: String (required),
    grade: Number (6-13),
    school: String,
    phone: String,
    avatar: String (URL),
    bio: String (max 500)
  },
  isActive: Boolean (default: true),
  emailVerified: Boolean (default: false),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Tutor (Subject Expert)**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  subjects: [{
    name: String,
    gradeLevels: [Number],
    hourlyRate: Number,
    description: String
  }],
  availability: [{
    dayOfWeek: Number (0-6),
    startTime: String (HH:MM),
    endTime: String (HH:MM),
    isRecurring: Boolean
  }],
  qualifications: {
    education: String,
    certifications: [String],
    experience: String,
    documents: [String] (URLs)
  },
  rating: {
    average: Number (0-5),
    totalReviews: Number,
    ratedBy: [ObjectId]
  },
  totalStudents: Number,
  totalSessions: Number,
  earnings: {
    totalEarned: Number,
    pending: Number,
    withdrawn: Number
  },
  isVerified: Boolean,
  status: 'active' | 'inactive' | 'suspended',
  createdAt: Date
}
```

#### 3. **Booking (Session Reservation)**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User, required),
  tutorId: ObjectId (ref: Tutor, required),
  subject: String,
  date: Date,
  startTime: String (HH:MM),
  endTime: String (HH:MM),
  duration: Number (minutes),
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  payment: {
    amount: Number,
    currency: String (default: USD),
    status: 'pending' | 'paid' | 'refunded',
    transactionId: String,
    stripePaymentIntentId: String
  },
  session: {
    roomId: String,
    joinUrl: String,
    recordingUrl: String,
    whiteboardData: String
  },
  feedback: {
    rating: Number (1-5),
    comment: String,
    filesShared: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Message (Chat)**
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User),
  content: String,
  attachments: [{
    type: String (file type),
    url: String
  }],
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

#### 5. **Review (Ratings)**
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  reviewerId: ObjectId (ref: User),
  revieweeId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String (max 500),
  categories: {
    communication: Number,
    expertise: Number,
    punctuality: Number,
    professionalism: Number
  },
  createdAt: Date
}
```

#### 6. **Notification**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (booking|message|review|system),
  title: String,
  message: String,
  data: Object (related data),
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## 🔐 Authentication & Authorization Flow

### 1. **Registration Flow**
```
User fills form → Frontend validation → API call
  → Server validates input
  → Hash password with bcrypt
  → Create user in MongoDB
  → Generate JWT token
  → Return user + token
  → Store token in localStorage
  → Redirect to dashboard
```

### 2. **Login Flow**
```
User enters credentials → API call
  → Find user by email/username
  → Compare password with bcrypt
  → If valid, generate JWT token
  → Return user + token
  → Store token in localStorage
  → Redirect based on role
```

### 3. **Token Usage**
```
Every API request:
  → Extract token from localStorage
  → Add to Authorization header: "Bearer {token}"
  → Server verifies JWT signature
  → Extract userId from token
  → Fetch user from DB
  → Attach user to request object
  → Process request
```

### 4. **Role-Based Access Control (RBAC)**
```
Routes protected by role middleware:
  /admin/* → requires 'admin' role
  /tutor/* → requires 'tutor' role
  /student/* → requires 'student' role
  /parent/* → requires 'parent' role
  
  Violations → 403 Forbidden response
```

---

## 🎨 User Roles & Capabilities

### 1. **Student**
- Browse and filter tutors
- Book tutoring sessions
- Join video sessions
- Send messages to tutors
- Rate and review tutors
- View learning progress
- Access materials

### 2. **Tutor**
- Create/update profile
- List subjects and pricing
- Set availability
- Accept/reject bookings
- Educate students in sessions
- Respond to messages
- Upload learning materials
- View earnings

### 3. **Parent**
- Link child's account
- Monitor child's bookings
- View session feedback
- Track learning progress
- Receive notifications

### 4. **Admin**
- User management (suspend, delete)
- Tutor verification
- Content moderation
- Report management
- Platform analytics
- System configuration

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
GET    /api/auth/me              - Current user info
PUT    /api/auth/change-password - Password change
POST   /api/auth/forgot-password - Password reset request
POST   /api/auth/reset-password  - Confirm password reset
```

### Users
```
GET    /api/users                - List users (admin only)
GET    /api/users/:id            - Get user profile
PUT    /api/users/:id            - Update profile
DELETE /api/users/:id            - Delete account (admin)
POST   /api/users/upload-avatar  - Upload profile picture
PUT    /api/users/:id/suspend    - Suspend user (admin)
PUT    /api/users/:id/activate   - Activate user (admin)
```

### Tutors
```
GET    /api/tutors               - Browse tutors (with filters)
GET    /api/tutors/:id           - Get tutor profile
POST   /api/tutors               - Create tutor profile
PUT    /api/tutors/:id           - Update tutor profile
POST   /api/tutors/:id/subjects  - Add subject
PUT    /api/tutors/:id/subjects/:subjectId - Update subject
DELETE /api/tutors/:id/subjects/:subjectId - Remove subject
POST   /api/tutors/:id/availability - Set availability
GET    /api/tutors/:id/reviews   - Get tutor reviews
GET    /api/tutors/:id/earnings  - Get tutor earnings
```

### Bookings
```
GET    /api/bookings             - Get user's bookings
POST   /api/bookings             - Create booking
GET    /api/bookings/:id         - Get booking details
PUT    /api/bookings/:id         - Update booking
PUT    /api/bookings/:id/confirm - Confirm booking
PUT    /api/bookings/:id/cancel  - Cancel booking
POST   /api/bookings/:id/reschedule - Reschedule booking
POST   /api/bookings/:id/join    - Join session
```

### Messages
```
GET    /api/messages             - Get conversations
GET    /api/messages/:conversationId - Get messages
POST   /api/messages             - Send message
PUT    /api/messages/:id/read    - Mark as read
DELETE /api/messages/:id         - Delete message
```

### Reviews
```
GET    /api/reviews              - Get reviews
POST   /api/reviews              - Submit review
GET    /api/reviews/:id          - Get review details
PUT    /api/reviews/:id          - Update review (author only)
DELETE /api/reviews/:id          - Delete review (author/admin)
```

### Notifications
```
GET    /api/notifications        - Get user's notifications
PUT    /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id    - Delete notification
POST   /api/notifications/mark-all-read - Mark all read
```

### Admin (Moderation)
```
GET    /api/moderation/reports   - Get reports
POST   /api/moderation/report    - File report
PUT    /api/moderation/reports/:id - Review report
POST   /api/moderation/actions   - Take moderation action
GET    /api/moderation/logs      - Get moderation logs
```

---

## 🚀 Real-time Features (Socket.io)

### Socket Events

**Client → Server:**
```javascript
socket.emit('join', userId)              // Join user room
socket.emit('send_message', messageData) // Send message
socket.emit('session_started', bookingId)// Start session
socket.emit('booking_updated', data)     // Update booking
```

**Server → Client:**
```javascript
socket.on('receive_message', messageData)// New message
socket.on('booking_update', data)        // Booking changed
socket.on('session_notification', data)  // Session event
socket.on('typing', data)                // User typing
```

---

## 🔄 Data Flow Examples

### Example 1: Student Booking a Tutor

```
1. FRONTEND
   └─ Student clicks "Book Session"
   └─ Opens booking form (calendar, time, subject)
   └─ Form validation in BookingViewModel
   └─ API call: POST /api/bookings

2. BACKEND
   └─ Route receives request
   └─ Middleware authenticates JWT token
   └─ Controller validates data
   └─ Service checks tutor availability
   └─ Saves booking to MongoDB
   └─ Emits Socket.io event to tutor
   └─ Returns booking details

3. FRONTEND
   └─ Receives response
   └─ Updates BookingViewModel state
   └─ Shows confirmation toast
   └─ Redirects to bookings list
   
4. REALTIME
   └─ Tutor receives notification via Socket.io
   └─ Dashboard updates immediately
   └─ Tutor can accept/reject booking
```

### Example 2: Tutor-Student Chat

```
1. STUDENT
   └─ Types message in UI
   └─ Clicks send button
   └─ MessageViewModel sends message
   └─ API: POST /api/messages

2. SERVER
   └─ Saves message to DB
   └─ Emits Socket.io event to tutor's room
   └─ Returns message with timestamp

3. REAL-TIME
   └─ Socket event triggers tutor's UI
   └─ Message appears instantly (no refresh)
   └─ Notification sent to tutor's device

4. TUTOR
   └─ Types reply
   └─ Process repeats to student
```

---

## 🎯 Key Features Implemented

| Feature | Frontend | Backend | Realtime |
|---------|----------|---------|----------|
| **User Authentication** | ✅ | ✅ | - |
| **Profile Management** | ✅ | ✅ | - |
| **Tutor Browsing** | ✅ | ✅ | - |
| **Booking System** | ✅ | ✅ | ✅ |
| **Messaging** | ✅ | ✅ | ✅ |
| **Video Sessions** | ✅ | ✅ | ✅ |
| **Ratings & Reviews** | ✅ | ✅ | - |
| **Notifications** | ✅ | ✅ | ✅ |
| **Materials/Resources** | ✅ | ✅ | - |
| **Admin Panel** | ✅ | ✅ | - |
| **Payment Processing** | 🔧 | 🔧 | - |
| **Analytics** | 🔧 | 🔧 | - |

(✅ = Implemented, 🔧 = In Progress/Needs API)

---

## ⚙️ Configuration Files

### Frontend (vite.config.js)
```javascript
// Dev server, API proxy, build settings
export default {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/peerlearn
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=your-stripe-key
```

---

## 🔍 Error Handling

### Frontend
```javascript
try {
  const response = await apiService.post('/api/bookings', bookingData);
  // Success handling
} catch (error) {
  // API error response
  console.error('Booking error:', error.response?.data?.message);
  toast.error(error.response?.data?.message || 'Failed to book');
}
```

### Backend
```javascript
// Validation error
if (!errors.isEmpty()) {
  return res.status(400).json({
    success: false,
    errors: errors.array()
  });
}

// Authentication error
if (!token) {
  return res.status(401).json({
    success: false,
    message: 'Unauthorized'
  });
}

// Authorization error
if (!roles.includes(user.role)) {
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}

// Server error
res.status(500).json({
  success: false,
  message: 'Internal server error'
});
```

---

## 🐛 Current Issues & Fixes Applied

### Issue 1: API Response Double-Wrapping ✅ FIXED
**Problem**: Backend returns `{success, data, message}` but frontend was wrapping it again
**Solution**: Updated api.js to detect and use existing structure

### Issue 2: Missing ViewModel Variables ✅ FIXED
**Problem**: AdminDashboard used `recentUsers`, `recentReports`, and `handleUserAction` without defining them
**Solution**: Added state initialization and useEffect hook to fetch data

### Issue 3: Duplicate Mongoose Indexes
**Problem**: Schemas had duplicate index definitions
**Solution**: Remove duplicate `schema.index()` calls (one per field)

---

## 📊 Database Relationships

```
User (1) ──────────────── (Many) Tutor
         └─ has profile

User (1) ──────────────── (Many) Booking
Tutor (1) ─────────────── (Many) Booking
         └─ reserved slots

User (1) ──────────────── (Many) Review
Tutor (1) ─────────────── (Many) Review
         └─ ratings

User (1) ──────────────── (Many) Message
         └─ sender/recipient

User (1) ──────────────── (Many) Notification
         └─ recipient

User (1) ──────────────── (Many) Material
Booking (1) ──────────────── (Many) Material
         └─ shared in session

User (1) ──────────────── (Many) Report
         └─ reporter
```

---

## 🎓 Learning Insights

### Architectural Benefits
1. **Clear Separation**: Models, ViewModels, Views are distinct
2. **Reusability**: Services can be used across components
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features without breaking existing code
5. **Maintainability**: Business logic isolated from UI

### Best Practices Implemented
1. ✅ JWT for stateless authentication
2. ✅ Password hashing with bcrypt
3. ✅ Input validation on both frontend & backend
4. ✅ Prototype protection with role-based access
5. ✅ Automatic token injection in requests
6. ✅ Real-time updates with Socket.io
7. ✅ Proper error handling and user feedback
8. ✅ Database indexing for performance

---

## 📝 Next Steps / Future Enhancements

1. **Payment Integration** - Complete Stripe integration
2. **Video Conference** - Integrate Zoom/WebRTC API
3. **Advanced Analytics** - Dashboard with metrics
4. **AI Features** - Recommendation engine
5. **Mobile App** - React Native version
6. **Testing** - Unit & integration tests
7. **Deployment** - Docker, CI/CD pipeline
8. **Security** - Rate limiting, CSRF protection

---

**Last Updated**: February 27, 2026  
**Status**: Development Phase - Core features implemented
