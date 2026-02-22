# Q&A Forum and Gamification System

A comprehensive Q&A forum with gamification features for the PeerLearn platform.

## Features

### Forum Features
- **Questions**: Post questions with title, body, tags, and categories
- **Answers**: Provide answers with voting and acceptance system
- **Comments**: Add comments to questions and answers
- **Voting**: Upvote/downvote questions and answers
- **Search & Filtering**: Search questions by text, category, tags, and sort options
- **Rich Text Editor**: Markdown support with live preview
- **Real-time Updates**: Live notifications for new answers, comments, and votes

### Gamification Features
- **Points System**: 
  - +2 points for posting a question
  - +5 points for posting an answer
  - +10 points for upvoted answers
  - +15 points for accepted answers
  - -1 point for downvoting
- **Badges**: Earn badges for various achievements
  - Subject mastery badges (Math Whiz, Science Expert, etc.)
  - Activity badges (First Question, Prolific Contributor, etc.)
  - Quality badges (Perfect Answer, Popular Question, etc.)
  - Community badges (Mentor, Community Leader, etc.)
  - Milestone badges (Century Club, Thousand Points, etc.)
- **Leaderboards**: 
  - Overall leaderboard
  - Subject-specific leaderboards
  - Badge leaderboards
  - Question/answer leaderboards
  - Time-based filtering (week, month, year, all time)

### Real-time Features
- **Socket.io Integration**: Real-time updates for:
  - New answers and comments
  - Vote updates
  - Typing indicators
  - Badge notifications
  - Leaderboard updates

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MongoDB connection string and other settings.

4. **Start the server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` and automatically initialize default badges.

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create `.env` file with:
   ```
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

4. **Start the frontend**:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`.

## Testing

### Automated Testing

Run the comprehensive test suite:

```bash
cd server
node test-forum.js
```

This will test:
- User authentication
- Question creation and retrieval
- Answer creation and voting
- Comment system
- Points and badges
- Leaderboard functionality

### Manual Testing

1. **Register/Login**: Create a new account or login
2. **Ask a Question**: Navigate to Forum → Ask Question
3. **Answer Questions**: View questions and provide answers
4. **Vote and Comment**: Interact with content
5. **Check Leaderboard**: View rankings and achievements
6. **Real-time Features**: Open multiple browser windows to see live updates

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions with filtering
- `POST /api/questions` - Create new question (auth required)
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question (auth required)
- `DELETE /api/questions/:id` - Delete question (auth required)
- `POST /api/questions/:id/close` - Close question (auth required)

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers/question/:questionId` - Create answer (auth required)
- `GET /api/answers/:id` - Get specific answer
- `PUT /api/answers/:id` - Update answer (auth required)
- `DELETE /api/answers/:id` - Delete answer (auth required)
- `POST /api/answers/:id/accept` - Accept answer (auth required)

### Votes
- `POST /api/votes` - Vote on question/answer (auth required)
- `GET /api/votes/user/:targetType/:targetId` - Get user vote (auth required)
- `GET /api/votes/counts/:targetType/:targetId` - Get vote counts
- `GET /api/votes/history` - Get vote history (auth required)

### Comments
- `GET /api/comments/:targetType/:targetId` - Get comments
- `POST /api/comments/:targetType/:targetId` - Create comment (auth required)
- `GET /api/comments/single/:id` - Get specific comment
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)

### Points
- `GET /api/points/user/:userId` - Get user points
- `GET /api/points/user/:userId/history` - Get points history
- `GET /api/points/leaderboard` - Get points leaderboard
- `GET /api/points/leaderboard/:subject` - Get subject leaderboard

### Badges
- `GET /api/badges` - Get all badges
- `GET /api/badges/user/:userId` - Get user badges
- `GET /api/badges/user/:userId/progress` - Get badge progress
- `POST /api/badges/award` - Award badge (admin only)
- `POST /api/badges/initialize` - Initialize default badges (admin only)

### Leaderboard
- `GET /api/leaderboard` - Get overall leaderboard
- `GET /api/leaderboard/subject/:subject` - Get subject leaderboard
- `GET /api/leaderboard/badges` - Get badge leaderboard
- `GET /api/leaderboard/questions` - Get question leaderboard
- `GET /api/leaderboard/answers` - Get answer leaderboard

## Database Schema

### User Model (Extended)
```javascript
{
  // ... existing fields
  reputation: Number,
  totalPoints: Number,
  badges: [ObjectId],
  subjectPoints: Map,
  forumStats: {
    questionsAsked: Number,
    answersGiven: Number,
    bestAnswers: Number,
    upvotesReceived: Number,
    downvotesReceived: Number
  }
}
```

### Question Model
```javascript
{
  title: String,
  body: String,
  tags: [String],
  category: String,
  author: ObjectId,
  views: Number,
  upvotes: Number,
  downvotes: Number,
  answerCount: Number,
  hasAcceptedAnswer: Boolean,
  isClosed: Boolean
}
```

### Answer Model
```javascript
{
  body: String,
  question: ObjectId,
  author: ObjectId,
  isAccepted: Boolean,
  acceptedBy: ObjectId,
  acceptedAt: Date,
  upvotes: Number,
  downvotes: Number,
  commentCount: Number
}
```

### Vote Model
```javascript
{
  targetType: String, // 'question' or 'answer'
  targetId: ObjectId,
  user: ObjectId,
  voteType: String // 'up' or 'down'
}
```

### PointTransaction Model
```javascript
{
  user: ObjectId,
  points: Number,
  type: String,
  referenceId: ObjectId,
  referenceType: String,
  description: String,
  metadata: Object
}
```

### Badge Model
```javascript
{
  name: String,
  description: String,
  icon: String,
  category: String,
  criteria: {
    type: String,
    value: Number,
    subject: String,
    timeFrame: String
  },
  pointsAwarded: Number,
  rarity: String,
  tier: Number
}
```

## Socket.io Events

### Client to Server
- `join` - Join user room
- `joinQuestion` - Join question room
- `leaveQuestion` - Leave question room
- `joinLeaderboard` - Join leaderboard room
- `typingAnswer` - Send typing indicator

### Server to Client
- `newQuestion` - New question posted
- `newAnswer` - New answer posted
- `answerPosted` - Answer notification
- `answerAccepted` - Answer accepted
- `voteUpdate` - Vote updated
- `newComment` - New comment
- `commentPosted` - Comment notification
- `badgeEarned` - Badge earned
- `userTyping` - User typing indicator

## Frontend Components

### Forum Components
- `QuestionList` - Main forum page with questions list
- `QuestionDetail` - Individual question page with answers
- `AskQuestion` - Form to create new question
- `AnswerList` - List of answers for a question
- `VoteButtons` - Voting component
- `CommentSection` - Comments component
- `RichTextEditor` - Markdown editor with preview

### Gamification Components
- `Leaderboard` - Leaderboard display
- `BadgeDisplay` - User badges
- `PointsDisplay` - User points and progress

### Hooks
- `useSocket` - Socket.io connection management
- `useSocketEvent` - Listen to socket events
- `useQuestionSocket` - Question-specific socket features

## Deployment Considerations

### Performance
- Database indexes for optimal query performance
- Caching for leaderboards and popular content
- Rate limiting for voting and posting

### Security
- Input validation and sanitization
- Rate limiting on API endpoints
- Authentication and authorization checks
- XSS protection

### Scalability
- Horizontal scaling with multiple server instances
- Redis for Socket.io session management
- CDN for static assets
- Database sharding if needed

## Troubleshooting

### Common Issues

1. **Socket.io Connection Issues**
   - Ensure CORS is properly configured
   - Check firewall settings
   - Verify client and server URLs match

2. **Database Connection Issues**
   - Check MongoDB connection string
   - Ensure MongoDB is running
   - Verify network connectivity

3. **Badge Initialization Issues**
   - Check server logs for errors
   - Manually initialize badges via API endpoint
   - Verify database permissions

4. **Real-time Updates Not Working**
   - Check Socket.io connection status
   - Verify event listeners are properly set up
   - Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
