// Simple Test Server for Q&A System Demo
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PeerGuru Q&A Test Server Running',
    timestamp: new Date().toISOString()
  });
});

// Sri Lankan subjects endpoint
app.get('/api/questions/subjects', (req, res) => {
  const subjects = {
    core: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Civic Education', 'Health & Physical Education'],
    religion: ['Buddhism', 'Islam', 'Saivaneri', 'Roman Catholicism', 'Christianity'],
    language: ['Sinhala', 'Tamil'],
    elective: ['ICT', 'Business & Accounting Studies', 'Agriculture', 'Aesthetic Studies']
  };

  res.json({
    success: true,
    subjects,
    grade: req.query.grade || 'all',
    message: 'Sri Lankan curriculum subjects for Grades 6-13'
  });
});

// Get questions with filtering
app.get('/api/questions', (req, res) => {
  const { subject, grade, page = 1, limit = 20 } = req.query;
  
  // Mock questions data
  const questions = [
    {
      _id: '1',
      title: 'What is Pythagorean theorem?',
      body: 'Can someone explain the Pythagorean theorem and how it is used in real life?',
      subject: 'Mathematics',
      grade: 8,
      tags: ['mathematics', 'geometry', 'grade 8'],
      author: { username: 'tutor1', profile: { firstName: 'John', lastName: 'Doe' } },
      views: 15,
      answerCount: 3,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Explain photosynthesis',
      body: 'What is photosynthesis and why is it important for plants?',
      subject: 'Science',
      grade: 7,
      tags: ['science', 'biology', 'grade 7'],
      author: { username: 'tutor2', profile: { firstName: 'Jane', lastName: 'Smith' } },
      views: 23,
      answerCount: 5,
      createdAt: new Date().toISOString()
    }
  ];

  // Filter by subject and grade if provided
  let filteredQuestions = questions;
  if (subject) {
    filteredQuestions = filteredQuestions.filter(q => q.subject === subject);
  }
  if (grade) {
    filteredQuestions = filteredQuestions.filter(q => q.grade === parseInt(grade));
  }

  res.json(filteredQuestions);
});

// Get question by ID
app.get('/api/questions/:id', (req, res) => {
  const question = {
    _id: req.params.id,
    title: 'What is Pythagorean theorem?',
    body: 'Can someone explain the Pythagorean theorem and how it is used in real life? I need to understand this for my Grade 8 mathematics exam.',
    subject: 'Mathematics',
    grade: 8,
    tags: ['mathematics', 'geometry', 'grade 8'],
    author: { username: 'tutor1', profile: { firstName: 'John', lastName: 'Doe' } },
    views: 15,
    answerCount: 3,
    createdAt: new Date().toISOString()
  };

  res.json(question);
});

// Get answers for question
app.get('/api/answers/question/:questionId', (req, res) => {
  const answers = [
    {
      _id: '1',
      body: 'The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²',
      question: req.params.questionId,
      author: { username: 'student1', profile: { firstName: 'Ali', lastName: 'Khan' } },
      status: 'correct',
      tutorComment: 'Excellent explanation! Clear and concise.',
      upvotes: 5,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      body: 'It is used to calculate distances in construction, navigation, and many real-world applications.',
      question: req.params.questionId,
      author: { username: 'student2', profile: { firstName: 'Nimal', lastName: 'Perera' } },
      status: 'needs_improvement',
      tutorComment: 'Good start, but please provide more mathematical details.',
      upvotes: 2,
      createdAt: new Date().toISOString()
    }
  ];

  res.json(answers);
});

// Create question (mock)
app.post('/api/questions', (req, res) => {
  const { title, body, subject, grade, tags } = req.body;
  
  const newQuestion = {
    _id: Date.now().toString(),
    title,
    body,
    subject,
    grade,
    tags: tags || [],
    author: { username: 'test_tutor', profile: { firstName: 'Test', lastName: 'Tutor' } },
    views: 0,
    answerCount: 0,
    createdAt: new Date().toISOString()
  };

  res.status(201).json(newQuestion);
});

// Create answer (mock)
app.post('/api/answers/question/:questionId', (req, res) => {
  const { body } = req.body;
  
  const newAnswer = {
    _id: Date.now().toString(),
    body,
    question: req.params.questionId,
    author: { username: 'test_student', profile: { firstName: 'Test', lastName: 'Student' } },
    status: 'pending',
    upvotes: 0,
    createdAt: new Date().toISOString()
  };

  res.status(201).json(newAnswer);
});

// Update answer status (tutor review)
app.patch('/api/answers/:id/status', (req, res) => {
  const { status, tutorComment } = req.body;
  
  const updatedAnswer = {
    _id: req.params.id,
    status,
    tutorComment: tutorComment || '',
    updatedAt: new Date().toISOString()
  };

  res.json(updatedAnswer);
});

// Update question (PUT method)
app.put('/api/questions/:id', (req, res) => {
  const { title, body, subject, grade, tags } = req.body;
  const questionId = req.params.id;
  
  const updatedQuestion = {
    _id: questionId,
    title: title || 'Updated: What is Pythagorean theorem?',
    body: body || 'Updated explanation of Pythagorean theorem with more details.',
    subject: subject || 'Mathematics',
    grade: grade || 8,
    tags: tags || ['mathematics', 'geometry', 'updated'],
    updatedAt: new Date().toISOString()
  };

  res.json(updatedQuestion);
});

// Update answer (PUT method)
app.put('/api/answers/:id', (req, res) => {
  const { body } = req.body;
  const answerId = req.params.id;
  
  const updatedAnswer = {
    _id: answerId,
    body: body || 'Updated answer content with more details.',
    updatedAt: new Date().toISOString()
  };

  res.json(updatedAnswer);
});

// Delete question
app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  
  res.json({
    success: true,
    message: 'Question deleted successfully',
    deletedQuestionId: questionId,
    timestamp: new Date().toISOString()
  });
});

// Delete answer
app.delete('/api/answers/:id', (req, res) => {
  const answerId = req.params.id;
  
  res.json({
    success: true,
    message: 'Answer deleted successfully',
    deletedAnswerId: answerId,
    timestamp: new Date().toISOString()
  });
});

// Statistics
app.get('/api/questions/stats', (req, res) => {
  res.json({
    totalQuestions: 2,
    openQuestions: 2,
    closedQuestions: 0,
    questionsBySubject: [
      { _id: 'Mathematics', count: 1 },
      { _id: 'Science', count: 1 }
    ]
  });
});

app.get('/api/answers/stats', (req, res) => {
  res.json({
    totalAnswers: 2,
    acceptedAnswers: 1,
    acceptanceRate: 50,
    answersByQuestion: [
      { _id: '1', count: 2 }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 PeerGuru Q&A Test Server running on port ${PORT}`);
  console.log(`🌐 Available API Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   GET    http://localhost:${PORT}/api/questions/subjects`);
  console.log(`   GET    http://localhost:${PORT}/api/questions?subject=Mathematics&grade=8`);
  console.log(`   GET    http://localhost:${PORT}/api/questions/1`);
  console.log(`   POST   http://localhost:${PORT}/api/questions`);
  console.log(`   PUT    http://localhost:${PORT}/api/questions/1`);
  console.log(`   DELETE http://localhost:${PORT}/api/questions/1`);
  console.log(`   GET    http://localhost:${PORT}/api/answers/question/1`);
  console.log(`   POST   http://localhost:${PORT}/api/answers/question/1`);
  console.log(`   PUT    http://localhost:${PORT}/api/answers/1`);
  console.log(`   DELETE http://localhost:${PORT}/api/answers/1`);
  console.log(`   PATCH  http://localhost:${PORT}/api/answers/1/status`);
  console.log(`   GET    http://localhost:${PORT}/api/questions/stats`);
  console.log(`   GET    http://localhost:${PORT}/api/answers/stats`);
});

module.exports = app;
