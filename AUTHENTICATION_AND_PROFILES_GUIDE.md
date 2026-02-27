# PeerLearn Authentication & Profile Module - Complete Implementation Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Models](#database-models)
3. [Backend Setup](#backend-setup)
4. [Security Measures](#security-measures)
5. [API Endpoints](#api-endpoints)
6. [Search Functionality](#search-functionality)
7. [OAuth Integration](#oauth-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### MERN Stack Components
```
Frontend (React)
├── Auth Pages (Login, Register, Forgot Password)
├── Profile Pages (View, Edit)
├── Search Components
└── Protected Routes

Backend (Node.js/Express)
├── Authentication Routes
├── User Profile Routes
├── Search API
└── Security Middleware

Database (MongoDB)
├── User Model (with OAuth fields)
├── Question Model (for QA system)
├── Material Model (for resources)
└── Search Indexes
```

---

## Database Models

### Enhanced User Model
```javascript
{
  // Basic Auth
  username: String,
  email: String,
  password: String (hashed with bcrypt),
  
  // OAuth
  oauth: {
    google: { id, email },
    facebook: { id, email }
  },
  
  // Profile Information
  profile: {
    firstName: String,
    lastName: String,
    avatar: String (URL),
    avatarPublicId: String (Cloudinary),
    bio: String,
    subjects: [String],
    strengths: [String],
    weaknesses: [String],
    qualifications: [String],
    experience: String,
    hourlyRate: Number,
    location: String
  },
  
  // Security
  emailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetCode: String,
  passwordResetExpires: Date,
  twoFactorEnabled: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  
  // Metadata
  role: String (student/tutor/parent/admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Question Model (for Q&A Search)
```javascript
{
  title: String,
  description: String,
  category: String,
  subject: String,
  difficulty: String (easy/medium/hard),
  author: ObjectId (User ref),
  answers: [{
    text: String,
    author: ObjectId,
    upvotes: Number,
    createdAt: Date
  }],
  tags: [String],
  views: Number,
  upvotes: Number,
  isResolved: Boolean,
  createdAt: Date
}
```

---

## Backend Setup

### 1. Environment Configuration (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/peerlearn

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@peerlearn.com

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth (Facebook)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Base URLs
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### 2. Update Server Index.js
Add these routes to your `server/index.js`:
```javascript
const searchRoutes = require('./routes/search');
const { generalLimiter, corsOptions } = require('./middleware/security');
const cors = require('cors');

app.use(cors(corsOptions));
app.use(generalLimiter);

// Search routes (no auth required for public search)
app.use('/api/search', searchRoutes);
```

### 3. Install Dependencies
```bash
cd server
npm install nodemailer express-rate-limit cloudinary dotenv
```

---

## Security Measures

### 1. Password Security
- ✅ Bcrypt hashing with cost factor 12
- ✅ Minimum 8 characters
- ✅ Uppercase, lowercase, numbers, special characters required
- ✅ Password strength validation

### 2. JWT Security
- ✅ Signed tokens with secret key
- ✅ 7-day expiration
- ✅ Refresh token mechanism
- ✅ Token revocation support

### 3. Rate Limiting
```javascript
// Auth endpoints: 5 attempts per 15 minutes
authLimiter

// Password reset: 3 attempts per hour
passwordResetLimiter

// Signup: 3 new accounts per IP per day
signupLimiter

// General API: 100 requests per 15 minutes
generalLimiter
```

### 4. Account Lockout
- Lock account after 5 failed login attempts
- Auto-unlock after 2 hours
- Admin can manually unlock

### 5. Email Verification
- Verification token expires in 24 hours
- Cannot perform sensitive actions until verified
- Resend email option available

### 6. Input Sanitization
- Remove HTML/script tags
- Trim whitespace
- Validate email format
- Length validation on all fields

### 7. CORS Configuration
- Only allow specified origins
- Credentials allowed
- Specific HTTP methods allowed
- 3600s cache for preflight requests

---

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "grade": 10,
    "school": "ABC School"
  }
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/verify-email`
Verify email address
```json
{
  "token": "verification-token-from-email"
}
```

#### POST `/api/auth/forgot-password`
Request password reset
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with code
```json
{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass456!"
}
```

### Profile Management

#### GET `/api/users/profile`
Get current user profile (Protected)

#### PUT `/api/users/profile`
Update user profile (Protected)
```json
{
  "profile": {
    "bio": "Passionate about mathematics",
    "subjects": ["Math", "Physics"],
    "strengths": ["Algebra", "Calculus"],
    "weaknesses": ["Geometry"],
    "phone": "9876543210"
  }
}
```

#### POST `/api/users/upload-avatar`
Upload profile picture (Protected)
- Multipart form-data
- Max size: 5MB
- Formats: jpg, png, gif
- Uses Cloudinary for storage

### Search

#### GET `/api/search?q=query&type=all`
Global search
```
Parameters:
- q (required): Search query
- type: all | users | questions | materials
- limit: Results per page (default: 10)
- page: Page number (default: 1)

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "questions": [...],
    "materials": [...]
  },
  "query": "search term"
}
```

#### GET `/api/search/advanced`
Advanced search with filters
```
Parameters:
- q (required): Search query
- subject: Filter by subject
- difficulty: easy | medium | hard
- grade: 6-13
- role: student | tutor | parent
- sortBy: relevance | recent | popular
```

#### GET `/api/search/suggestions?q=partial`
Get auto-completion suggestions
```
Response:
{
  "success": true,
  "data": {
    "suggestions": [
      { "type": "user", "value": "johndoe", "avatar": "..." },
      { "type": "subject", "value": "Mathematics" },
      { "type": "tag", "value": "algebra" }
    ]
  }
}
```

---

## Search Functionality

### Database Indexes
```javascript
// Text search indexes for relevance
User.index({ username: 'text', email: 'text', 'profile.bio': 'text' })
Question.index({ title: 'text', description: 'text', tags: 'text' })
Material.index({ title: 'text', description: 'text', tags: 'text' })

// Filter indexes for performance
User.index({ role: 1 })
Material.index({ subject: 1, grade: 1 })
Question.index({ subject: 1, difficulty: 1 })
```

### Search Features
1. **Full-Text Search**: Searches across multiple fields with relevance scoring
2. **Filter by Category**: Subject, difficulty, grade, role
3. **Auto-suggestions**: As-you-type suggestions
4. **Pagination**: Efficient result pagination
5. **Sorting**: By relevance, date, popularity

---

## OAuth Integration

### Google OAuth Setup
1. Create Google OAuth application at https://console.cloud.google.com
2. Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Set redirect URI to `http://localhost:5000/api/auth/google/callback`

### Facebook OAuth Setup
1. Create app at https://developers.facebook.com
2. Get `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`
3. Set redirect URI to `http://localhost:5000/api/auth/facebook/callback`

### OAuth Routes (to be implemented)
```
GET /api/auth/google - Redirect to Google login
GET /api/auth/google/callback - Handle Google callback

GET /api/auth/facebook - Redirect to Facebook login
GET /api/auth/facebook/callback - Handle Facebook callback
```

---

## Best Practices

### 1. Frontend Security
```javascript
// ✅ Store JWT in httpOnly cookie instead of localStorage
// ✅ Use same-origin for API calls
// ✅ Implement CSRF protection
// ✅ Sanitize user input before display
// ✅ Use HTTPS only in production
```

### 2. Backend Security
```javascript
// ✅ Never log passwords
// ✅ Implement request validation
// ✅ Use parameterized queries
// ✅ Regular security audits
// ✅ Keep dependencies updated
// ✅ Monitor failed login attempts
```

### 3. Email Best Practices
```javascript
// ✅ Use app-specific passwords for Gmail
// ✅ Consider SendGrid/AWS SES for production
// ✅ Implement email throttling
// ✅ Log all email sending
// ✅ Handle bounce/complaint feedback
```

### 4. File Upload Security
```javascript
// ✅ Validate file type (whitelist)
// ✅ Check file size limits
// ✅ Scan for malware
// ✅ Use CDN for file delivery
// ✅ Implement file access control
```

### 5. Database Security
```javascript
// ✅ Use MongoDB connection string with credentials
// ✅ Enable authentication in MongoDB
// ✅ Use IP whitelist if possible
// ✅ Regular backups
// ✅ Encrypt sensitive data at rest
```

---

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details"
}
```

### HTTP Status Codes
- 200: Success
- 400: Bad request (validation error)
- 401: Unauthorized (invalid credentials)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 429: Too many requests (rate limited)
- 500: Server error

---

## Troubleshooting

### Issue: Password Reset Email Not Sending
**Solution:**
- Check .env EMAIL_USER and EMAIL_PASS
- Enable "Less secure app access" for Gmail
- Use app-specific password (not main password)
- Check email service status

### Issue: OAuth Not Working
**Solution:**
- Verify CLIENT_ID and CLIENT_SECRET
- Check redirect URI matches exactly
- Clear browser cache and cookies
- Check OAuth app status

### Issue: Search Not Returning Results
**Solution:**
- Ensure text indexes are created: `db.users.getIndexes()`
- Check query syntax
- Verify data exists in database
- Check MongoDB text search documentation

### Issue: Account Getting Locked
**Solution:**
- Wait 2 hours for auto-unlock
- Admin can manually reset loginAttempts
- Check email for password reset option

---

## File Structure
```
server/
├── models/
│   ├── User.js (enhanced)
│   ├── Question.js (new)
│   └── Material.js (enhanced with text search)
├── controllers/
│   ├── authController.js (existing, can be enhanced)
│   └── searchController.js (new)
├── routes/
│   ├── auth.js (existing)
│   └── search.js (new)
├── middleware/
│   ├── auth.js (existing)
│   └── security.js (new - rate limiting, validation)
├── services/
│   └── emailService.js (new)
└── index.js (updated with search routes)

client/
├── pages/
│   ├── LoginView.jsx (existing)
│   ├── RegisterView.jsx (existing)
│   └── ProfilePage.jsx (to create)
├── components/
│   ├── SearchBar.jsx (to create)
│   └── ProfileEditor.jsx (to create)
└── services/
    └── searchService.js (to create)
```

---

## Next Steps

### Frontend Implementation
- [ ] Create SearchBar component with autocomplete
- [ ] Create ProfileEdit page with avatar upload
- [ ] Add email verification page
- [ ] Implement OAuth login buttons
- [ ] Create search results page
- [ ] Add profile view page

### Backend Enhancements
- [ ] Implement Google/Facebook OAuth
- [ ] Add Cloudinary integration for image upload
- [ ] Implement two-factor authentication
- [ ] Add email queue system
- [ ] Implement notification system
- [ ] Add audit logging

### DevOps
- [ ] Set up production environment
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

---

## Support & Resources

- MongoDB Documentation: https://docs.mongodb.com
- Express Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- JWT Security: https://github.com/jwtk/jjwt
- OWASP Security Guidelines: https://owasp.org/www-project-top-ten/
