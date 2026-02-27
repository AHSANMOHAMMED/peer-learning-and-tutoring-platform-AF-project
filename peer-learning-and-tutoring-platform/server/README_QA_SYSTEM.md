# PeerGuru Q&A System Documentation

## 🎓 Overview
PeerGuru is a Sri Lankan educational platform for Grades 6-13 with a comprehensive Questions and Answers system. The platform supports multiple user roles and follows the Sri Lankan curriculum.

## 📚 Sri Lankan Subjects Supported

### Core Subjects
- Mathematics
- English
- Science
- History
- Geography
- Civic Education
- Health & Physical Education

### Religion Subjects
- Buddhism
- Islam
- Saivaneri
- Roman Catholicism
- Christianity

### Language Subjects
- Sinhala
- Tamil

### Elective Subjects
- ICT
- Business & Accounting Studies
- Agriculture
- Aesthetic Studies

## 🛠️ API Endpoints

### Questions API

#### Get Sri Lankan Subjects
```http
GET /api/questions/subjects?grade=8
```
**Response:**
```json
{
  "success": true,
  "subjects": {
    "core": ["Mathematics", "English", "Science", ...],
    "religion": ["Buddhism", "Islam", ...],
    "language": ["Sinhala", "Tamil"],
    "elective": ["ICT", "Business & Accounting Studies", ...]
  },
  "grade": 8,
  "message": "Sri Lankan curriculum subjects for Grades 6-13"
}
```

#### Get Questions (with filtering)
```http
GET /api/questions?subject=Mathematics&grade=8&page=1&limit=20
```
**Query Parameters:**
- `subject` (optional): Filter by subject
- `grade` (optional): Filter by grade (6-13)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in title and body
- `tags` (optional): Filter by tags (comma-separated)

#### Create Question (requires authentication)
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "What is Pythagorean theorem?",
  "body": "Can someone explain the Pythagorean theorem?",
  "subject": "Mathematics",
  "grade": 8,
  "tags": ["mathematics", "geometry"]
}
```

#### Get Question by ID
```http
GET /api/questions/:id
```

#### Update Question (requires authentication)
```http
PUT /api/questions/:id
Authorization: Bearer <token>
```

#### Delete Question (requires authentication)
```http
DELETE /api/questions/:id
Authorization: Bearer <token>
```

### Answers API

#### Get Answers for Question
```http
GET /api/answers/question/:questionId?status=all&page=1&limit=20
```
**Query Parameters:**
- `status` (optional): Filter by status (pending/correct/incorrect/needs_improvement)
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Create Answer (requires authentication)
```http
POST /api/answers/question/:questionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "body": "The Pythagorean theorem states that a² + b² = c²..."
}
```

#### Update Answer (requires authentication)
```http
PUT /api/answers/:id
Authorization: Bearer <token>
```

#### Delete Answer (requires authentication)
```http
DELETE /api/answers/:id
Authorization: Bearer <token>
```

#### Update Answer Status (Tutor/Admin only)
```http
PATCH /api/answers/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "correct",
  "tutorComment": "Good explanation! Keep it up."
}
```
**Status Options:**
- `pending`: Default status
- `correct`: Answer is correct
- `incorrect`: Answer is incorrect
- `needs_improvement`: Answer needs improvement

### Statistics API

#### Get Question Statistics
```http
GET /api/questions/stats
```

#### Get Answer Statistics
```http
GET /api/answers/stats
```

## 🗄️ Database Schema

### Question Model
```javascript
{
  title: String (required, max 300),
  body: String (required, max 10000),
  subject: String (required, enum of Sri Lankan subjects),
  grade: Number (required, 6-13),
  tags: [String],
  author: ObjectId (ref: User),
  views: Number (default: 0),
  upvotes: Number (default: 0),
  downvotes: Number (default: 0),
  answerCount: Number (default: 0),
  isClosed: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Answer Model
```javascript
{
  body: String (required, max 10000),
  question: ObjectId (ref: Question, required),
  author: ObjectId (ref: User, required),
  status: String (enum: pending/correct/incorrect/needs_improvement),
  tutorComment: String (max 1000),
  isAccepted: Boolean (default: false),
  acceptedBy: ObjectId (ref: User),
  acceptedAt: Date,
  upvotes: Number (default: 0),
  downvotes: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Run API Tests
```bash
cd server
npm install axios
node test_apis.js
```

### Test Endpoints Manually

1. **Get Subjects:**
```bash
curl http://localhost:5000/api/questions/subjects
```

2. **Get Questions:**
```bash
curl "http://localhost:5000/api/questions?subject=Mathematics&grade=8"
```

3. **Get Question Stats:**
```bash
curl http://localhost:5000/api/questions/stats
```

4. **Get Answers for Question:**
```bash
curl http://localhost:5000/api/answers/question/[question-id]
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Best Practices

1. **Input Validation:** All inputs are validated using express-validator
2. **Error Handling:** Comprehensive error handling with proper HTTP status codes
3. **Security:** Authentication and authorization checks on all protected routes
4. **Performance:** Pagination and indexing for efficient queries
5. **Real-time:** Socket.io integration for live updates
6. **Data Integrity:** MongoDB transactions for related operations

## 🚀 Getting Started

1. **Install Dependencies:**
```bash
cd server
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your database and JWT settings
```

3. **Start Server:**
```bash
npm start
# or for development
npm run dev
```

4. **Test APIs:**
```bash
node test_apis.js
```

## 📊 Features Implemented

✅ **4+ Working API Endpoints:**
- GET /api/questions/subjects
- GET /api/questions (with filtering)
- POST /api/questions (create)
- GET /api/answers/question/:id
- PATCH /api/answers/:id/status (tutor review)

✅ **MongoDB Integration:**
- Mongoose models with proper schemas
- Indexing for performance
- Population for related data

✅ **Well-Structured Code:**
- MVC architecture
- Separation of concerns
- Consistent error handling
- Comprehensive validation

✅ **Sri Lankan Curriculum:**
- All required subjects for Grades 6-13
- Proper grade validation
- Subject-based filtering

✅ **Role-Based Access:**
- Student permissions
- Tutor permissions
- Admin permissions
- Parent permissions (read-only)

## 🎯 Next Steps

1. **Authentication System:** Complete user registration/login
2. **Frontend Integration:** React components for Q&A
3. **File Uploads:** Support for images in questions/answers
4. **Notifications:** Email/SMS for answer reviews
5. **Analytics:** Advanced reporting and insights
