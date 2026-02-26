# Subject-Based Q&A Platform Backend

A production-ready backend module for a subject-based Q&A platform similar to Stack Overflow/Reddit hybrid with points, badges and leaderboards.

## 🏗️ Architecture

### Models (MongoDB Schemas)

#### User (assumed existing)
- `_id`, `username`, `email`, `reputation`, `badges`, `subjectsContributed`

#### Question
```javascript
{
  title: String (required, min 10, max 300),
  body: String (required, min 20),
  tags: [String],
  subject: String (required, enum),
  createdBy: ObjectId (ref: User),
  votes: Number (default 0),
  answerCount: Number (default 0)
}
```

#### Answer
```javascript
{
  body: String (required, min 20),
  question: ObjectId (ref: Question),
  createdBy: ObjectId (ref: User),
  votes: Number (default 0),
  isAccepted: Boolean (default false)
}
```

#### Vote
```javascript
{
  user: ObjectId (ref: User),
  targetType: String (enum: ['Question','Answer']),
  targetId: ObjectId,
  voteType: String (enum: ['up','down'])
}
// Compound unique index: user + targetType + targetId
```

#### PointTransaction
```javascript
{
  user: ObjectId (ref: User),
  points: Number,
  reason: String,
  targetType: String,
  targetId: ObjectId,
  subject: String
}
```

#### Badge
```javascript
{
  name: String (unique),
  description: String,
  iconUrl: String,
  requiredPoints: Number,
  subject: String,
  oneTime: Boolean (default true)
}
```

## 💰 Point System

**Exact Point Rules:**
- Post question → **+2 points**
- Answer gets upvote → **+10 points**
- Answer gets downvote → **-2 points**
- Question gets upvote → **+5 points** (optional)

Every point change:
- Increases/decreases user.reputation
- Creates PointTransaction document
- Checks badge eligibility → awards badge(s) if conditions met

## 🏆 Badge System

**Implemented Badges:**
1. **"First Question"** → 1 question posted (global)
2. **"Curious Mind"** → 5 questions posted (global)
3. **"{Subject} Contributor"** → 50 points in one subject
4. **"Rising Star"** → total reputation ≥ 100 (global)
5. **"Superstar"** → total reputation ≥ 500 (global)

## 🛣️ API Endpoints

### Questions
```
POST   /api/questions           → create question (+2 points)
GET    /api/questions           → list (newest first, ?subject=xxx & ?tag=xxx optional)
GET    /api/questions/:id       → single question + its answers
DELETE /api/questions/:id       → only own question
```

### Answers
```
POST   /api/questions/:qid/answers     → create answer
GET    /api/questions/:qid/answers     → get answers (sorted by votes desc, then newest)
```

### Voting (single endpoint – idempotent & prevents double voting)
```
POST   /api/vote
Body: { targetType: "Question"|"Answer", targetId, voteType: "up"|"down" }
→ toggle / change / remove vote if already exists
→ update vote count on target
→ award / remove points
→ create PointTransaction
→ check & award badges
```

### Leaderboard
```
GET /api/leaderboard/global?limit=20&period=week|month|all
GET /api/leaderboard/subject/:subject?limit=10
```

## 🔧 Key Implementation Details

### Point & Badge Logic
- Uses mongoose middleware and service layer functions
- Prevents self-voting
- Handles vote changes (up→down or vice-versa) correctly
- Removes points when vote is removed
- Makes badge awarding idempotent

### MongoDB Aggregation
- Leaderboards use MongoDB aggregation pipeline
- Efficient for large datasets
- Supports time-based filtering (week/month/all)

### Error Handling
- Proper HTTP status codes (400, 403, 404, 500)
- Meaningful error messages
- Input validation with express-validator

## 📁 File Structure

```
server/
├── models/
│   ├── Question.js
│   ├── Answer.js
│   ├── Vote.js
│   ├── PointTransaction.js
│   └── Badge.js
├── controllers/
│   ├── questionController.js
│   ├── answerController.js
│   ├── voteController.js
│   └── leaderboardController.js
├── services/
│   ├── pointsService.js
│   ├── badgeService.js
│   └── badgeInitializationService.js
├── routes/
│   ├── questions.js
│   ├── answers.js
│   ├── votes.js
│   └── leaderboard.js
├── middleware/
│   ├── auth.js
│   └── validate.js
└── scripts/
    └── initializeSystem.js
```

## 🚀 Getting Started

1. **Initialize the system:**
```bash
cd server
node scripts/initializeSystem.js
```

2. **Start the server:**
```bash
npm start
```

3. **Test the API endpoints** using the provided routes

## 🧪 Testing

The system includes comprehensive point tracking and badge awarding. Test scenarios:

1. **Question Creation:**
   - User posts question → +2 points
   - Check for "First Question" badge

2. **Voting System:**
   - Upvote answer → +10 points to author
   - Downvote answer → -2 points to author
   - Change vote → correct point adjustment
   - Remove vote → reverse points

3. **Badge Awarding:**
   - Reach 100 points → "Rising Star" badge
   - Earn 50 points in Mathematics → "Mathematics Contributor" badge

## 📊 Features

### Real-time Updates
- Socket.io integration for live vote updates
- Badge awarding notifications
- New question announcements

### Performance
- Optimized MongoDB indexes
- Efficient aggregation pipelines
- Pagination support

### Security
- Input validation and sanitization
- Self-voting prevention
- Authentication middleware

### Analytics
- Point transaction history
- User progress tracking
- Leaderboard statistics

## 🔍 Monitoring

The system provides comprehensive analytics:
- Total points awarded
- Points by type
- Top earners
- Recent transactions
- Badge distribution

## 🎯 Business Logic

### Vote Processing
1. Check for existing vote
2. Toggle/create/remove vote
3. Calculate point changes
4. Award/remove points
5. Update target vote counts
6. Check badge eligibility
7. Emit real-time events

### Badge Awarding
1. Check user qualification for each badge
2. Verify user doesn't already have badge
3. Award badge if qualified
4. Award bonus points if applicable
5. Send notification

This system provides a complete, scalable foundation for a subject-based Q&A platform with gamification elements.
