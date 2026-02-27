# API URLs - Quick Reference

Base URL: `http://localhost:5000`

---

## POST URLs

```
http://localhost:5000/api/auth/register
http://localhost:5000/api/auth/login
http://localhost:5000/api/auth/forgot-password
http://localhost:5000/api/auth/reset-password
http://localhost:5000/api/auth/logout
http://localhost:5000/api/tutors
http://localhost:5000/api/bookings
http://localhost:5000/api/reviews
http://localhost:5000/api/questions
http://localhost:5000/api/answers
http://localhost:5000/api/users/avatar
```

---

## GET URLs

```
http://localhost:5000/api/auth/me
http://localhost:5000/api/users/profile
http://localhost:5000/api/users
http://localhost:5000/api/users/:id
http://localhost:5000/api/tutors
http://localhost:5000/api/tutors/:id
http://localhost:5000/api/bookings
http://localhost:5000/api/bookings/:id
http://localhost:5000/api/reviews/tutor/:tutorId
http://localhost:5000/api/questions
http://localhost:5000/api/questions/:id
http://localhost:5000/api/notifications
```

---

## PUT URLs

```
http://localhost:5000/api/auth/change-password
http://localhost:5000/api/users/profile
http://localhost:5000/api/users/:id
http://localhost:5000/api/tutors/:id
http://localhost:5000/api/bookings/:id
http://localhost:5000/api/reviews/:id
http://localhost:5000/api/questions/:id
http://localhost:5000/api/answers/:id
http://localhost:5000/api/notifications/:id/read
http://localhost:5000/api/users/settings
```

---

## DELETE URLs

```
http://localhost:5000/api/users/:id
http://localhost:5000/api/tutors/:id
http://localhost:5000/api/bookings/:id
http://localhost:5000/api/reviews/:id
http://localhost:5000/api/questions/:id
http://localhost:5000/api/answers/:id
http://localhost:5000/api/notifications/:id
```

---

## Quick Test Examples

### Login
```
POST http://localhost:5000/api/auth/login
Body: {"email":"admin@peerlearn.com","password":"Admin@12345"}
```

### Get Profile
```
GET http://localhost:5000/api/users/profile
Header: Authorization: Bearer YOUR_TOKEN
```

### Update Profile
```
PUT http://localhost:5000/api/users/profile
Header: Authorization: Bearer YOUR_TOKEN
Body: {"profile":{"firstName":"John","lastName":"Doe"}}
```

### Delete Notification
```
DELETE http://localhost:5000/api/notifications/NOTIFICATION_ID
Header: Authorization: Bearer YOUR_TOKEN
```
