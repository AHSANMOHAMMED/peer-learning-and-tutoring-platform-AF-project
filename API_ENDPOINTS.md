# API ENDPOINTS - POST, GET, PUT, DELETE

Base URL: `http://localhost:5000`

---

## 🟢 GET Endpoints

### Authentication
```
GET http://localhost:5000/api/auth/me
Headers: Authorization: Bearer {token}
```

### Users
```
GET http://localhost:5000/api/users/:id
GET http://localhost:5000/api/users
Headers: Authorization: Bearer {token}
```

### Tutors
```
GET http://localhost:5000/api/tutors
GET http://localhost:5000/api/tutors/:id
```

### Bookings
```
GET http://localhost:5000/api/bookings
GET http://localhost:5000/api/bookings/:id
Headers: Authorization: Bearer {token}
```

### Reviews
```
GET http://localhost:5000/api/reviews/tutor/:tutorId
```

### Questions (Forum)
```
GET http://localhost:5000/api/questions
GET http://localhost:5000/api/questions/:id
```

### Notifications
```
GET http://localhost:5000/api/notifications
Headers: Authorization: Bearer {token}
```

---

## 🔵 POST Endpoints

### Authentication
```
POST http://localhost:5000/api/auth/register
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "firstName": "Test",
    "lastName": "User"
  }
}
```

```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@peerlearn.com",
  "password": "Admin@12345"
}
```

```
POST http://localhost:5000/api/auth/forgot-password
Body: {
  "email": "test@example.com"
}
```

```
POST http://localhost:5000/api/auth/reset-password
Body: {
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

### Tutors
```
POST http://localhost:5000/api/tutors
Headers: Authorization: Bearer {token}
Body: {
  "subjects": ["Math", "Physics"],
  "hourlyRate": 25,
  "availability": []
}
```

### Bookings
```
POST http://localhost:5000/api/bookings
Headers: Authorization: Bearer {token}
Body: {
  "tutorId": "tutor-id-here",
  "subject": "Math",
  "date": "2024-03-01",
  "duration": 60
}
```

### Reviews
```
POST http://localhost:5000/api/reviews
Headers: Authorization: Bearer {token}
Body: {
  "tutorId": "tutor-id-here",
  "rating": 5,
  "comment": "Great tutor!"
}
```

### Questions (Forum)
```
POST http://localhost:5000/api/questions
Headers: Authorization: Bearer {token}
Body: {
  "title": "How to solve quadratic equations?",
  "content": "I need help understanding...",
  "subject": "Math",
  "tags": ["algebra", "equations"]
}
```

### Answers
```
POST http://localhost:5000/api/answers
Headers: Authorization: Bearer {token}
Body: {
  "questionId": "question-id-here",
  "content": "Here's how to solve it..."
}
```

---

## 🟡 PUT Endpoints

### Authentication
```
PUT http://localhost:5000/api/auth/change-password
Headers: Authorization: Bearer {token}
Body: {
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Users
```
PUT http://localhost:5000/api/users/profile
Headers: Authorization: Bearer {token}
Body: {
  "profile": {
    "firstName": "Updated",
    "lastName": "Name",
    "bio": "Updated bio"
  }
}
```

```
PUT http://localhost:5000/api/users/:id
Headers: Authorization: Bearer {token}
Body: {
  "isActive": false
}
```

### Tutors
```
PUT http://localhost:5000/api/tutors/:id
Headers: Authorization: Bearer {token}
Body: {
  "hourlyRate": 30,
  "subjects": ["Math", "Physics", "Chemistry"]
}
```

### Bookings
```
PUT http://localhost:5000/api/bookings/:id
Headers: Authorization: Bearer {token}
Body: {
  "status": "confirmed"
}
```

### Reviews
```
PUT http://localhost:5000/api/reviews/:id
Headers: Authorization: Bearer {token}
Body: {
  "rating": 4,
  "comment": "Updated review"
}
```

### Questions
```
PUT http://localhost:5000/api/questions/:id
Headers: Authorization: Bearer {token}
Body: {
  "title": "Updated title",
  "content": "Updated content"
}
```

### Notifications
```
PUT http://localhost:5000/api/notifications/:id/read
Headers: Authorization: Bearer {token}
```

---

## 🔴 DELETE Endpoints

### Users
```
DELETE http://localhost:5000/api/users/:id
Headers: Authorization: Bearer {token}
```

### Tutors
```
DELETE http://localhost:5000/api/tutors/:id
Headers: Authorization: Bearer {token}
```

### Bookings
```
DELETE http://localhost:5000/api/bookings/:id
Headers: Authorization: Bearer {token}
```

### Reviews
```
DELETE http://localhost:5000/api/reviews/:id
Headers: Authorization: Bearer {token}
```

### Questions
```
DELETE http://localhost:5000/api/questions/:id
Headers: Authorization: Bearer {token}
```

### Answers
```
DELETE http://localhost:5000/api/answers/:id
Headers: Authorization: Bearer {token}
```

### Notifications
```
DELETE http://localhost:5000/api/notifications/:id
Headers: Authorization: Bearer {token}
```

---

## 📝 Quick Test Examples

### 1. Login (POST)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peerlearn.com","password":"Admin@12345"}'
```

### 2. Get Current User (GET)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Update Profile (PUT)
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"profile":{"firstName":"John","lastName":"Doe"}}'
```

### 4. Delete Notification (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Test in Postman

### Import Collection
1. Open Postman
2. Create new collection "PeerLearn API"
3. Add requests with above URLs
4. Set Authorization header with token from login

### Environment Variables
```
base_url: http://localhost:5000
token: (get from login response)
```

---

## ✅ Summary

| Method | Count | Example |
|--------|-------|---------|
| GET | 10+ | `/api/users/:id` |
| POST | 10+ | `/api/auth/login` |
| PUT | 8+ | `/api/users/profile` |
| DELETE | 7+ | `/api/notifications/:id` |

**Total: 35+ Working Endpoints**
