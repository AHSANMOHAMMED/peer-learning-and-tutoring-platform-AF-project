# 🔌 API Testing with Seed Data

Quick reference for testing backend endpoints with seed data.

## 🔐 Authentication Required

Most endpoints require a JWT token. Get one by logging in first:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@peerlearn.com",
    "password": "Student@123"
  }'

# Response will include:
# { "token": "eyJhbGciOi...", "user": {...} }
```

**Save the token and use it in subsequent requests:**
```bash
TOKEN="your_token_here"
```

---

## 📚 Materials API

### Get All Approved Materials
```bash
curl -X GET "http://localhost:5000/api/materials?status=approved" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 3 materials (Calculus, Hamlet, Periodic Table)
```

### Get Material by ID
```bash
# Use any material ID from the database
MATERIAL_ID="65f123..." 

curl -X GET "http://localhost:5000/api/materials/$MATERIAL_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Materials by Subject
```bash
curl -X GET "http://localhost:5000/api/materials?subject=Mathematics" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 1 material (Calculus)
```

### Get Pending Materials (Moderator Only)
```bash
# Login as moderator first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "moderator1@peerlearn.com",
    "password": "Mod@123456"
  }'

MOD_TOKEN="moderator_token_here"

curl -X GET "http://localhost:5000/api/materials/pending" \
  -H "Authorization: Bearer $MOD_TOKEN"

# Expected: 3 pending materials
```

### Approve Material (Moderator Only)
```bash
MATERIAL_ID="65f123..."

curl -X PUT "http://localhost:5000/api/materials/$MATERIAL_ID/approve" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json"
```

### Reject Material (Moderator Only)
```bash
MATERIAL_ID="65f123..."

curl -X PUT "http://localhost:5000/api/materials/$MATERIAL_ID/reject" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Content violates guidelines"
  }'
```

---

## 🎓 Tutors API

### Get All Tutors
```bash
curl -X GET "http://localhost:5000/api/tutors" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 3 tutors (Alex, Sarah, David)
```

### Get Tutor by ID
```bash
TUTOR_ID="65f123..."

curl -X GET "http://localhost:5000/api/tutors/$TUTOR_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Tutors by Subject
```bash
curl -X GET "http://localhost:5000/api/tutors?subject=Mathematics" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 1 tutor (Alex Johnson)
```

---

## 📅 Sessions API

### Get My Sessions (Student View)
```bash
curl -X GET "http://localhost:5000/api/sessions/my-sessions" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Mix of pending, confirmed, completed sessions
```

### Get Upcoming Sessions
```bash
curl -X GET "http://localhost:5000/api/sessions?status=confirmed" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 2 confirmed sessions
```

### Get Session Requests (Tutor View)
```bash
# Login as tutor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor.math@peerlearn.com",
    "password": "Tutor@123456"
  }'

TUTOR_TOKEN="tutor_token_here"

curl -X GET "http://localhost:5000/api/sessions/requests" \
  -H "Authorization: Bearer $TUTOR_TOKEN"

# Expected: Pending session requests for this tutor
```

### Accept Session Request (Tutor)
```bash
SESSION_ID="65f123..."

curl -X PUT "http://localhost:5000/api/sessions/$SESSION_ID/accept" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json"
```

### Reject Session Request (Tutor)
```bash
SESSION_ID="65f123..."

curl -X PUT "http://localhost:5000/api/sessions/$SESSION_ID/reject" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Time conflict"
  }'
```

### Create New Session Booking (Student)
```bash
curl -X POST "http://localhost:5000/api/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "65f123...",
    "subject": "Mathematics",
    "date": "2026-03-01",
    "startTime": "15:00",
    "endTime": "16:00",
    "description": "Need help with calculus"
  }'
```

### Submit Session Feedback (Student)
```bash
SESSION_ID="65f123..."

curl -X POST "http://localhost:5000/api/sessions/$SESSION_ID/feedback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent session!"
  }'
```

---

## 🚨 Moderation / Reports API

### Get All Reports (Moderator Only)
```bash
curl -X GET "http://localhost:5000/api/reports" \
  -H "Authorization: Bearer $MOD_TOKEN"

# Expected: 4 reports (2 pending, 1 under review, 1 resolved)
```

### Get Pending Reports
```bash
curl -X GET "http://localhost:5000/api/reports?status=pending" \
  -H "Authorization: Bearer $MOD_TOKEN"

# Expected: 2 pending reports
```

### Get Report by ID
```bash
REPORT_ID="65f123..."

curl -X GET "http://localhost:5000/api/reports/$REPORT_ID" \
  -H "Authorization: Bearer $MOD_TOKEN"
```

### Create Report (Any User)
```bash
curl -X POST "http://localhost:5000/api/reports" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportedType": "material",
    "reportedId": "65f123...",
    "reason": "inappropriate",
    "description": "This material contains inappropriate content"
  }'
```

### Update Report Status (Moderator)
```bash
REPORT_ID="65f123..."

curl -X PUT "http://localhost:5000/api/reports/$REPORT_ID" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution": {
      "action": "content_removed",
      "notes": "Inappropriate material has been removed"
    }
  }'
```

### Approve Report (Take Action)
```bash
REPORT_ID="65f123..."

curl -X PUT "http://localhost:5000/api/reports/$REPORT_ID/approve" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json"
```

### Dismiss Report
```bash
REPORT_ID="65f123..."

curl -X PUT "http://localhost:5000/api/reports/$REPORT_ID/dismiss" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Not a violation"
  }'
```

---

## 👥 Users API

### Get Current User Profile
```bash
curl -X GET "http://localhost:5000/api/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Update User Profile
```bash
curl -X PUT "http://localhost:5000/api/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "firstName": "Updated",
      "lastName": "Name",
      "bio": "New bio"
    }
  }'
```

### Get All Users (Admin Only)
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@peerlearn.com",
    "password": "Admin@123"
  }'

ADMIN_TOKEN="admin_token_here"

curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 10 users
```

### Ban User (Moderator/Admin)
```bash
USER_ID="65f123..."

curl -X PUT "http://localhost:5000/api/users/$USER_ID/ban" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violating community guidelines",
    "duration": 7
  }'
```

### Suspend User (Moderator/Admin)
```bash
USER_ID="65f123..."

curl -X PUT "http://localhost:5000/api/users/$USER_ID/suspend" \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Multiple warnings",
    "duration": 3
  }'
```

---

## ⭐ Reviews API

### Get Reviews for Tutor
```bash
TUTOR_ID="65f123..."

curl -X GET "http://localhost:5000/api/reviews?tutorId=$TUTOR_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 2 reviews for some tutors
```

### Get Review by ID
```bash
REVIEW_ID="65f123..."

curl -X GET "http://localhost:5000/api/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Review (Student, after completed session)
```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "65f123...",
    "tutorId": "65f123...",
    "rating": {
      "overall": 5,
      "teaching": 5,
      "knowledge": 5,
      "communication": 4,
      "punctuality": 5
    },
    "comment": "Great tutor! Highly recommend."
  }'
```

---

## 🔍 Testing Workflow Examples

### Workflow 1: Student Books and Completes Session

```bash
# 1. Student login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student1@peerlearn.com", "password": "Student@123"}'

TOKEN="student_token"

# 2. Browse tutors
curl -X GET "http://localhost:5000/api/tutors" \
  -H "Authorization: Bearer $TOKEN"

# 3. Book session
curl -X POST "http://localhost:5000/api/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "...",
    "subject": "Mathematics",
    "date": "2026-03-01",
    "startTime": "15:00",
    "endTime": "16:00"
  }'

# 4. After session ends, submit feedback
curl -X POST "http://localhost:5000/api/sessions/{SESSION_ID}/feedback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "Great session!"}'
```

### Workflow 2: Tutor Accepts Session Request

```bash
# 1. Tutor login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tutor.math@peerlearn.com", "password": "Tutor@123456"}'

TUTOR_TOKEN="tutor_token"

# 2. Check pending requests
curl -X GET "http://localhost:5000/api/sessions/requests" \
  -H "Authorization: Bearer $TUTOR_TOKEN"

# 3. Accept a request
curl -X PUT "http://localhost:5000/api/sessions/{SESSION_ID}/accept" \
  -H "Authorization: Bearer $TUTOR_TOKEN"
```

### Workflow 3: Moderator Reviews Content

```bash
# 1. Moderator login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "moderator1@peerlearn.com", "password": "Mod@123456"}'

MOD_TOKEN="moderator_token"

# 2. Get pending materials
curl -X GET "http://localhost:5000/api/materials/pending" \
  -H "Authorization: Bearer $MOD_TOKEN"

# 3. Approve material
curl -X PUT "http://localhost:5000/api/materials/{MATERIAL_ID}/approve" \
  -H "Authorization: Bearer $MOD_TOKEN"

# 4. Get pending reports
curl -X GET "http://localhost:5000/api/reports?status=pending" \
  -H "Authorization: Bearer $MOD_TOKEN"

# 5. Resolve report
curl -X PUT "http://localhost:5000/api/reports/{REPORT_ID}/approve" \
  -H "Authorization: Bearer $MOD_TOKEN"
```

---

## 🧪 Quick Verification Queries

### Check Material Counts by Status
```bash
# Approved
curl -X GET "http://localhost:5000/api/materials?status=approved" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
# Expected: 3

# Pending
curl -X GET "http://localhost:5000/api/materials/pending" \
  -H "Authorization: Bearer $MOD_TOKEN" | jq 'length'
# Expected: 3
```

### Check Session Counts by Status
```bash
# Pending
curl -X GET "http://localhost:5000/api/sessions?status=pending" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
# Expected: 2

# Confirmed
curl -X GET "http://localhost:5000/api/sessions?status=confirmed" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
# Expected: 2
```

### Check Report Counts by Status
```bash
# Pending
curl -X GET "http://localhost:5000/api/reports?status=pending" \
  -H "Authorization: Bearer $MOD_TOKEN" | jq 'length'
# Expected: 2

# Resolved
curl -X GET "http://localhost:5000/api/reports?status=resolved" \
  -H "Authorization: Bearer $MOD_TOKEN" | jq 'length'
# Expected: 1
```

---

## 💡 Tips

1. **Save tokens in environment variables** for easier testing
2. **Use `jq` tool** to pretty-print JSON responses
3. **Check data IDs** in MongoDB before testing specific endpoints
4. **Use Postman/Insomnia** for more interactive testing
5. **Enable verbose mode** with `-v` flag to see full request/response

```bash
# Example with verbose output
curl -v -X GET "http://localhost:5000/api/materials" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Health Check

Before starting API tests, verify backend is running:

```bash
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "ok",
#   "message": "PeerLearn API is running",
#   "timestamp": "2026-02-27T..."
# }
```

---

## ✅ All endpoints tested successfully means:

- ✅ Authentication working
- ✅ All CRUD operations functional
- ✅ Role-based access control enforced
- ✅ Database properly seeded
- ✅ API ready for frontend integration

**Happy Testing! 🚀**
