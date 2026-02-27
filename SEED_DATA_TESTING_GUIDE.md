# 🧪 Seed Data Testing Guide

## ✅ Status
- **Backend Server**: Running on http://localhost:5000 ✅
- **Frontend Server**: Running on http://localhost:3000 ✅
- **Database**: Populated with 33 test records ✅

---

## 🔐 Test Credentials

### Admin Account
```
Email: admin@peerlearn.com
Password: Admin@123
Role: admin
```

### Moderator Account  
```
Email: moderator1@peerlearn.com
Password: Mod@123456
Role: student (has moderation access)
```

### Tutor Accounts
```
Math Tutor:
  Email: tutor.math@peerlearn.com
  Password: Tutor@123456
  Subjects: Mathematics, Physics
  Hourly Rate: $25-28

English Tutor:
  Email: tutor.english@peerlearn.com
  Password: Tutor@123456
  Subjects: English, History
  Hourly Rate: $20-22

Science Tutor:
  Email: tutor.science@peerlearn.com
  Password: Tutor@123456
  Subjects: Chemistry, Biology
  Hourly Rate: $24-26
```

### Student Accounts
```
Student 1:
  Email: student1@peerlearn.com
  Password: Student@123
  Grade: 10

Student 2:
  Email: student2@peerlearn.com
  Password: Student@123
  Grade: 9

Student 3:
  Email: student3@peerlearn.com
  Password: Student@123
  Grade: 11

Student 4:
  Email: student4@peerlearn.com
  Password: Student@123
  Grade: 8
```

---

## 📊 Seed Data Summary

### Users Created: 10
- 1 Admin
- 2 Moderators (have student role)
- 3 Tutors
- 4 Students

### Tutors Created: 3
- Alex Johnson (Mathematics, Physics) - 4.8★ rating, 45 reviews
- Sarah Williams (English, History) - 4.7★ rating, 38 reviews  
- David Brown (Chemistry, Biology) - 4.6★ rating, 32 reviews

### Materials Created: 7
**Status Breakdown:**
- ✅ **3 Approved**: Ready for browsing
  - Advanced Calculus Notes (Math) - Approved 7 days ago
  - Shakespeare's Hamlet Study Guide (English) - Approved 5 days ago
  - Periodic Table Quiz (Chemistry) - Approved 3 days ago

- ⏳ **3 Pending**: Need moderator review
  - Vector Mathematics Tutorial (Math) - Pending 2 hours
  - French Vocabulary Builder (Languages) - Pending 1 hour
  - Photosynthesis Animation (Biology) - Pending 30 minutes

- ❌ **1 Rejected**: Previous rejection
  - Outdated Physics Formulas - Rejected 10 days ago

### Session Bookings Created: 7
- ✅ **2 Confirmed**: Upcoming sessions
- ⏳ **2 Pending**: Awaiting tutor acceptance
- ⌛ **1 In Progress**: Active session (today)
- ✔️ **2 Completed**: With feedback/reviews

### Reports Created: 4
- ⏳ **2 Pending**: Need moderator action
  - Copyright violation on Hamlet guide
  - Inappropriate language on vocabulary material

- 🔍 **1 Under Review**: Assigned to moderator
  - Harassment report (high priority)

- ✅ **1 Resolved**: Action completed
  - Spam report - content removed

### Reviews Created: 2 (on completed sessions)
- Alex Johnson: ⭐⭐⭐⭐⭐ (5.0) - Mathematics session
- Sarah Williams: ⭐⭐⭐⭐ (4.0) - English session

---

## 🧪 Page-by-Page Testing Guide

### 1️⃣ Dashboard Page
**What to test:**
- [ ] Login as teacher/student → See personalized dashboard
- [ ] Verify dashboard widgets display correctly
- [ ] Check "Upcoming Sessions" widget shows future bookings
- [ ] Login as moderator → See "Pending Reviews" widget (should show 2)
- [ ] Login as admin → Verify admin-specific widgets

**Expected Data:**
- Upcoming sessions: 3 (2 confirmed + 1 pending)
- Pending reports: 2 (moderator view)
- Average tutor ratings visible

**Test Flow:**
1. Open http://localhost:3000
2. Login with `student1@peerlearn.com / Student@123`
3. Verify dashboard loads with seed data
4. Logout and login as `moderator1@peerlearn.com / Mod@123456`
5. Check moderator-specific widgets

---

### 2️⃣ Browse Materials Page (`/materials`)
**What to test:**
- [ ] List all approved materials (should show 3)
- [ ] Filter by subject (Mathematics, English, Chemistry)
- [ ] Search by text (try: "calculus", "hamlet", "periodic")
- [ ] Filter by grade level
- [ ] Click "Download" on materials without errors
- [ ] Click "Report" button to open report form
- [ ] Detail modal opens and displays content

**Expected Data:**
- 3 materials visible (approved only)
- Subjects: Mathematics, English, Chemistry
- Grades: 10, 11, 12

**Test Flow:**
1. Login as `student1@peerlearn.com / Student@123`
2. Navigate to Materials/Browse
3. Verify 3 approved materials appear
4. Try filtering by "Mathematics" (should show 1)
5. Search "hamlet" (should show 1)
6. Click on a material card to view details
7. Test report button

---

### 3️⃣ Upload Material Page (`/materials/upload`)
**What to test:**
- [ ] Form fields render correctly (title, description, subject, tags)
- [ ] File drag-drop area works
- [ ] Form validation triggers (required fields)
- [ ] Submit button disabled until form is complete
- [ ] Success notification after upload
- [ ] Redirect to materials page after upload

**Expected Behavior:**
- Title input: max 100 characters
- Description: max 500 characters
- Tags: max 5 tags
- File size: max 50MB

**Test Flow:**
1. Login as `student1@peerlearn.com / Student@123`
2. Navigate to Upload Material
3. Fill in form (don't submit)
4. Test form validation (leave subject empty, try to submit)
5. Complete form with test data
6. Upload a file (can use any file < 50MB)
7. Verify success toast appears
8. Verify redirect to materials page

---

### 4️⃣ Approval Queue Page (`/admin/approvals`)
**What to test:**
- [ ] Page only accessible to moderators (test access control)
- [ ] Shows 3 pending materials in queue
- [ ] Stats box shows: pending=3, approved=3, dismissed=0
- [ ] Bulk action checkboxes work
- [ ] Individual approve/reject buttons work
- [ ] Rejection reason dropdown functional
- [ ] Detail modal loads material info correctly
- [ ] Status updates after approval/rejection

**Expected Data:**
- Pending: 3 materials
- Approved: 3 materials
- Rejected: 1 material

**Test Flow:**
1. Login as `student1@peerlearn.com` → Try accessing /admin/approvals → Should redirect (not moderator)
2. Login as `moderator1@peerlearn.com / Mod@123456`
3. Navigate to Approval Queue
4. Verify 3 pending materials show in queue
5. Click on first material to view details modal
6. Test "Approve" button in modal
7. Verify status changes to "Approved"
8. Try "Reject" with a rejection reason
9. Test bulk select checkbox
10. Test "Approve All" / "Reject All" bulk buttons

---

### 5️⃣ Session Room Page (`/sessions/room/:id`)
**What to test:**
- [ ] Jitsi iframe loads correctly (may need Jitsi credentials)
- [ ] Room name displays: "peerlearn-{sessionId}"
- [ ] Session header shows: subject, participants, status
- [ ] "End Session" button visible
- [ ] Feedback modal appears after session ends
- [ ] Rating (1-5 stars) input works
- [ ] Comment textarea accepts input
- [ ] Submit button saves feedback

**Note:** Jitsi Meet requires credentials to fully test. For basic UI testing:

**Test Flow:**
1. Will need an active/confirmed session ID from database
2. Navigate to `/sessions/room/{sessionId}`
3. Verify header displays correctly
4. Verify Jitsi iframe is present (may show error if not configured)
5. Test "End Session" button (may not fully work without real session)
6. Check if feedback form appears

---

### 6️⃣ Schedule Session Page (`/sessions/schedule`)
**What to test:**
- [ ] Tutor dropdown shows all 3 tutors
- [ ] Selecting tutor updates right panel with tutor info
- [ ] Date picker disabled for past dates
- [ ] Time picker shows available times (based on tutor availability)
- [ ] End time must be after start time (validation)
- [ ] Submit button creates booking
- [ ] Success notification appears
- [ ] Redirect to My Sessions page

**Expected Tutors:**
- Alex Johnson ($25/hr) - Math, Physics
- Sarah Williams ($22/hr) - English, History
- David Brown ($24/hr) - Chemistry, Biology

**Test Flow:**
1. Login as `student1@peerlearn.com / Student@123`
2. Navigate to Schedule Session
3. Select "Alex Johnson" from tutor dropdown
4. Verify tutor info appears on right panel (shows rate, subjects, rating)
5. Select tomorrow's date
6. Select start time 15:00, end time 16:00
7. Enter description
8. Click Schedule
9. Verify success notification
10. Verify redirect to My Sessions

---

### 7️⃣ My Sessions Page (`/sessions/my-sessions`)
**What to test - Student View:**
- [ ] Status filter buttons work (All, Pending, Confirmed, Completed)
- [ ] Displays 2 confirmed + 2 pending sessions (4 total student sessions in seed)
- [ ] Shows session cards with subject, tutor/student name, date/time
- [ ] "Join Video" button visible for in_progress sessions
- [ ] Status badge shows correct color and text

**What to test - Tutor View:**
- [ ] Tabs display: "Incoming Requests" and "My Sessions"
- [ ] Incoming Requests shows pending session requests (2 total)
- [ ] Accept/Reject buttons functional
- [ ] My Sessions shows confirmed, in-progress, completed sessions
- [ ] Feedback displays on completed sessions

**Expected Data:**
- Student view: 2 pending + 2 confirmed + 1 in-progress = 5 total
- Tutor view: Incoming requests (varies by tutor)

**Test Flow (Student):**
1. Login as `student1@peerlearn.com / Student@123`
2. Navigate to My Sessions
3. Verify "All" tab shows all sessions
4. Click "Confirmed" filter (should show 2)
5. Click "Pending" filter (should show 2)
6. Click "Completed" filter (should show 1)
7. Verify session cards display correctly

**Test Flow (Tutor):**
1. Login as `tutor.math@peerlearn.com / Tutor@123456`
2. Navigate to My Sessions
3. Check "Incoming Requests" tab (should show pending bookings)
4. Test Accept button on a request
5. Verify session moves to "My Sessions" tab
6. Check completed sessions show feedback

---

### 8️⃣ Moderation Dashboard / Reports
**What to test:**
- [ ] Only accessible to moderators
- [ ] Displays pending reports (should show 2)
- [ ] Reports table shows: reporter, reported content, reason, priority
- [ ] Click report to view details
- [ ] Action buttons: Dismiss, Approve, Review
- [ ] Priority badge colors (urgent=red, high=orange, medium=yellow, low=gray)
- [ ] Filter by status works

**Expected Reports:**
- Pending: 2 (copyright, inappropriate)
- Under Review: 1 (harassment)
- Resolved: 1 (spam)

**Test Flow:**
1. Login as `moderator1@peerlearn.com / Mod@123456`
2. Navigate to Moderation/Reports (typically `/admin/reports` or `/moderation`)
3. Verify 2 pending reports appear
4. Click on first report to see details
5. Read reason and description
6. Test action buttons
7. Use status filter to view "Under Review" reports
8. Verify report displays correctly

---

## 🔍 API Testing

You can also test the backend API directly using curl or Postman:

### Get All Materials (Approved)
```bash
curl -X GET http://localhost:5000/api/materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Pending Materials (Moderator)
```bash
curl -X GET http://localhost:5000/api/materials?status=pending \
  -H "Authorization: Bearer MODERATOR_TOKEN"
```

### List All Tutors
```bash
curl -X GET http://localhost:5000/api/tutors
```

### List Reports
```bash
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer MODERATOR_TOKEN"
```

### Get User Sessions
```bash
curl -X GET http://localhost:5000/api/sessions/my-sessions \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## ✨ Features Demonstrated by Seed Data

### 1. **Role-Based Access Control**
- Different users see different pages/data
- Moderators see additional management pages
- Admins have full platform access

### 2. **Material Management Lifecycle**
- Approved materials (ready to use)
- Pending materials (awaiting review)
- Rejected materials (with reasons)

### 3. **Session Booking Flow**
- Student requests session
- Tutor accepts/rejects request
- Session becomes confirmed
- Students and tutors can join video room
- Feedback collected after session

### 4. **Moderation & Safety**
- Users can report inappropriate content
- Moderators review and take action
- Multiple priority levels
- Resolution tracking

### 5. **Tutoring Marketplace**
- Multiple tutors with different specialties
- Rate display ($20-$28/hour range)
- Tutor ratings and reviews
- Tutor availability
- Student feedback on tutors

---

## 🐛 Troubleshooting

### Issue: Login fails with "Invalid credentials"
**Solution:** Double-check email and password. Use credentials from this guide exactly.

### Issue: Materials page shows no data
**Solution:** 
1. Verify you're logged in as a student
2. Check backend is running: `curl http://localhost:5000/api/health`
3. Reseed database: `cd server && npm run seed`

### Issue: Pages show "Access Denied"
**Solution:**
- Some pages require moderator role (moderator1@peerlearn.com)
- Check the page requirements above

### Issue: Jitsi Room doesn't load
**Solution:**
- This requires Jitsi Meet credentials
- For testing UI only, the iframe will appear but may show errors
- This is expected without full Jitsi configuration

### Issue: Backend crashes
**Solution:**
1. Check MongoDB is running: `mongod --version`
2. Check port 5000 is free: `lsof -i :5000`
3. Restart server: `cd server && npm run dev`

---

## 📈 Next Steps

1. ✅ **Verify all pages display seed data** (use this guide)
2. ✅ **Test user flows** (follow the Test Flows above)
3. ✅ **Test access control** (try accessing pages without permission)
4. ✅ **Test form submissions** (create new materials, schedule sessions)
5. 🔄 **Prepare for production** (clear seed data, deploy)

---

## 🎯 Success Criteria

Your platform is working correctly if:
- ✅ All users can login with provided credentials
- ✅ Dashboard shows different content per role
- ✅ 3 materials visible on Browse page
- ✅ 3 pending materials in Approval queue
- ✅ 3 tutors appear in Schedule dropdown
- ✅ 2 pending reports visible to moderators
- ✅ Session booking flow works end-to-end
- ✅ Moderators can approve/reject materials
- ✅ Students can report content

**Platform is ready for production when all criteria are met! 🚀**
