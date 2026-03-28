# Peer Learning Platform - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.peerlearning.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "grade": "10",
    "subjects": ["Mathematics", "Physics"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

---

## Peer Matching Endpoints

### GET /peer-matching
Get recommended peers based on profile.

**Query Parameters:**
- `subject` (optional): Filter by subject
- `grade` (optional): Filter by grade
- `role` (optional): Filter by role (tutor/student)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Smith",
      "role": "tutor",
      "profile": {
        "subjects": ["Mathematics"],
        "grade": "11"
      },
      "reputation": 4.8
    }
  ]
}
```

### POST /peer/sessions
Request a peer tutoring session.

**Request Body:**
```json
{
  "matchedPeerId": "user_id",
  "subject": "Mathematics",
  "scheduledAt": "2024-03-15T10:00:00Z",
  "message": "I need help with calculus"
}
```

---

## Group Study Endpoints

### GET /group-rooms
Get available group study rooms.

**Query Parameters:**
- `subject` (optional): Filter by subject
- `grade` (optional): Filter by grade level

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "room_id",
      "name": "Math Study Group",
      "subject": "Mathematics",
      "host": { ... },
      "participants": [...],
      "maxParticipants": 10,
      "isActive": true
    }
  ]
}
```

### POST /group-rooms
Create a new group study room.

**Request Body:**
```json
{
  "name": "Physics Study Group",
  "subject": "Physics",
  "description": "Preparing for final exams",
  "maxParticipants": 8,
  "isPrivate": false
}
```

---

## Lecture Endpoints

### GET /courses
Get all available lecture courses.

**Query Parameters:**
- `subject` (optional): Filter by subject
- `grade` (optional): Filter by target grade
- `instructor` (optional): Filter by instructor

### POST /courses
Create a new lecture course (Instructor only).

**Request Body:**
```json
{
  "title": "Advanced Calculus",
  "subject": "Mathematics",
  "targetGrade": "11-12",
  "description": "Comprehensive calculus course",
  "duration": 60,
  "maxStudents": 30
}
```

### GET /lectures/session/:sessionId
Get lecture session details.

### POST /lectures/:sessionId/join
Join a lecture session.

---

## Interactive Session Endpoints

### Breakout Rooms

#### POST /breakout/:sessionId/create
Create breakout rooms for a session.

**Request Body:**
```json
{
  "roomCount": 4,
  "participants": [{"userId": "user1"}, {"userId": "user2"}],
  "assignmentType": "random"
}
```

#### POST /breakout/:sessionId/start
Start breakout rooms.

#### POST /breakout/:sessionId/end
End breakout rooms and return to main session.

### Polling

#### POST /lectures/:sessionId/polls
Create a new poll.

**Request Body:**
```json
{
  "question": "What is 2 + 2?",
  "options": ["3", "4", "5"],
  "type": "single_choice",
  "duration": 60
}
```

#### POST /lectures/polls/:pollId/start
Start the poll.

#### POST /lectures/polls/:pollId/vote
Submit a vote.

**Request Body:**
```json
{
  "optionIds": ["opt_1"]
}
```

### File Sharing

#### POST /files/upload/:sessionId
Upload a file to a session.

**Request Body (multipart/form-data):**
- `file`: File to upload

#### GET /files/session/:sessionId
Get all files for a session.

#### GET /files/download/:fileId
Download a file.

### Q&A Queue

#### POST /qa/:sessionId/questions
Submit a question.

**Request Body:**
```json
{
  "text": "Can you explain this concept?",
  "isAnonymous": false
}
```

#### POST /qa/:sessionId/questions/:questionId/upvote
Upvote a question.

---

## Gamification Endpoints

### GET /gamification/points/:userId
Get user's points and achievements.

### GET /gamification/leaderboard/:category
Get leaderboard for a category.

**Categories:**
- `overall`: Overall ranking
- `tutoring`: Tutoring hours
- `sessions`: Session participation

### POST /gamification/badges/:userId/award
Award a badge to a user (Admin only).

---

## AI Features Endpoints

### POST /ai/homework-help
Get AI-powered homework assistance.

**Request Body:**
```json
{
  "subject": "Mathematics",
  "question": "How do I solve quadratic equations?",
  "grade": "10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Step-by-step explanation...",
    "resources": [...],
    "practiceProblems": [...]
  }
}
```

### POST /ai/transcribe
Transcribe audio/video content.

**Request Body (multipart/form-data):**
- `audio`: Audio file

### POST /ai/summarize
Generate summary from text.

**Request Body:**
```json
{
  "text": "Long text content here...",
  "type": "session"
}
```

---

## Recommendation Endpoints

### GET /recommendations
Get personalized recommendations for the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "peers": [...],
    "groups": [...],
    "studyMaterials": [...]
  }
}
```

### GET /recommendations/trending
Get trending content across the platform.

---

## Analytics Endpoints

### GET /analytics/user/:userId
Get user analytics and progress.

### GET /analytics/session/:sessionId
Get session engagement analytics.

### GET /analytics/admin/dashboard
Get admin dashboard statistics (Admin only).

---

## WebSocket Events

Real-time events for live sessions:

### Client to Server:
- `join_session`: Join a lecture session
- `session_message`: Send a message
- `whiteboard_stroke`: Draw on whiteboard
- `poll_vote`: Submit poll vote
- `qa_question`: Ask a question

### Server to Client:
- `participant_joined`: New participant joined
- `new_message`: New message received
- `whiteboard_update`: Whiteboard updated
- `poll_created`: New poll created
- `question_answered`: Question was answered

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- AI Endpoints: 20 requests per minute
- File Upload: 10 files per hour

---

## Support

For API support or questions, please contact:
- Email: support@peerlearning.com
- Documentation: https://docs.peerlearning.com
