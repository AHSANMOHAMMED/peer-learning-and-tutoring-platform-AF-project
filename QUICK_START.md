# 🚀 Quick Start - Testing with Seed Data

## ⚡ Fastest Way to Test

### 1️⃣ Open Browser
```
http://localhost:3000
```

### 2️⃣ Login as Student
```
Email: student1@peerlearn.com
Password: Student@123
```

### 3️⃣ Test These Pages Now
- ✅ Dashboard → See personalized widgets
- ✅ Browse Materials → See 3 approved materials
- ✅ Schedule Session → See 3 tutors
- ✅ My Sessions → See your bookings

---

## 🔐 All Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student1@peerlearn.com | Student@123 |
| Tutor | tutor.math@peerlearn.com | Tutor@123456 |
| Moderator | moderator1@peerlearn.com | Mod@123456 |
| Admin | admin@peerlearn.com | Admin@123 |

---

## 📊 What's in the Database

- **10 Users** (1 admin, 2 moderators, 3 tutors, 4 students)
- **7 Materials** (3 approved, 3 pending, 1 rejected)
- **7 Sessions** (2 confirmed, 2 pending, 1 in-progress, 2 completed)
- **4 Reports** (2 pending, 1 under review, 1 resolved)
- **3 Tutors** (Math, English, Science - all with ratings)
- **2 Reviews** (on completed sessions)

---

## 🎯 5-Minute Test Flow

### As Student (2 min)
1. Login → student1@peerlearn.com
2. Browse Materials → Filter by "Mathematics"
3. Schedule Session → Pick "Alex Johnson" tutor
4. My Sessions → View your bookings

### As Moderator (2 min)
1. Login → moderator1@peerlearn.com
2. Approval Queue → See 3 pending materials
3. Reports → See 2 pending reports
4. Take action (approve/reject)

### As Tutor (1 min)
1. Login → tutor.math@peerlearn.com
2. My Sessions → "Incoming Requests" tab
3. Accept/Reject session requests

---

## 🔄 If You Need to Reset Data

```bash
cd server
npm run seed
```

This will:
- Clear all data
- Create fresh test data
- Show login credentials

---

## 📚 Full Documentation

- **SEED_DATA_COMPLETE.md** - Everything about seed data
- **SEED_DATA_TESTING_GUIDE.md** - Detailed page-by-page testing
- **API_TESTING_GUIDE.md** - Test backend APIs with curl

---

## ✅ Servers Running

- **Frontend:** http://localhost:3000 ✅
- **Backend:** http://localhost:5000 ✅
- **Health Check:** http://localhost:5000/api/health ✅

---

## 💡 Quick Tips

1. **Different views for different roles** - Login changes what you see
2. **3 materials are immediately browsable** - No need to approve
3. **2 pending reports** - For moderators to review
4. **All passwords follow pattern** - Role@123456 or Role@123

---

## 🎉 You're Ready!

Everything is set up. Just open http://localhost:3000 and start testing!

**Need help?** Check SEED_DATA_COMPLETE.md for full details.
