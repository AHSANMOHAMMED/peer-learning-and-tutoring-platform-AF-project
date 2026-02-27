// MongoDB Integration Test Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test MongoDB connection with real models
const Question = require('./models/Question');
const Answer = require('./models/Answer');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PeerGuru Q&A Server with MongoDB Running',
    timestamp: new Date().toISOString(),
    mongodb: 'Connected'
  });
});

// Get Sri Lankan subjects
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

// Get questions from MongoDB
app.get('/api/questions', async (req, res) => {
  try {
    const { subject, grade, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);
    
    const questions = await Question.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create question in MongoDB
app.post('/api/questions', async (req, res) => {
  try {
    const { title, body, subject, grade, tags } = req.body;
    
    // Validate subject exists in Sri Lankan curriculum
    const allSubjects = [
      'Mathematics', 'English', 'Science', 'History', 'Geography', 'Civic Education', 
      'Health & Physical Education', 'Buddhism', 'Islam', 'Saivaneri', 
      'Roman Catholicism', 'Christianity', 'Sinhala', 'Tamil', 
      'ICT', 'Business & Accounting Studies', 'Agriculture', 'Aesthetic Studies'
    ];
    
    if (!allSubjects.includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject. Must be from Sri Lankan curriculum.' });
    }
    
    if (grade < 6 || grade > 13) {
      return res.status(400).json({ error: 'Grade must be between 6 and 13.' });
    }
    
    const question = new Question({
      title,
      body,
      subject,
      grade,
      tags: tags || [],
      author: '507f1f77bcf86cd799439011' // Mock user ID for testing
    });
    
    await question.save();
    await question.populate('author', 'username profile.firstName profile.lastName');
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Get answers for question from MongoDB
app.get('/api/answers/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { status = 'all' } = req.query;
    
    const query = { question: questionId };
    if (status !== 'all') query.status = status;
    
    const answers = await Answer.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: 1 });
    
    res.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// Create answer in MongoDB
app.post('/api/answers/question/:questionId', async (req, res) => {
  try {
    const { body } = req.body;
    const { questionId } = req.params;
    
    const answer = new Answer({
      body,
      question: questionId,
      author: '507f1f77bcf86cd799439012' // Mock user ID for testing
    });
    
    await answer.save();
    await answer.populate('author', 'username profile.firstName profile.lastName');
    
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

// Update question (PUT)
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { title, body, subject, grade, tags } = req.body;
    
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { title, body, subject, grade, tags },
      { new: true, runValidators: true }
    ).populate('author', 'username profile.firstName profile.lastName');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question from MongoDB
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Delete related answers
    await Answer.deleteMany({ question: req.params.id });
    
    res.json({
      success: true,
      message: 'Question and related answers deleted successfully',
      deletedQuestionId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// MongoDB statistics
app.get('/api/mongodb/stats', async (req, res) => {
  try {
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();
    
    res.json({
      mongodb: 'Connected',
      database: 'peerguru',
      questions: questionCount,
      answers: answerCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PeerGuru Q&A Server with MongoDB running on port ${PORT}`);
  console.log(`🌐 MongoDB Integration Test Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   GET    http://localhost:${PORT}/api/mongodb/stats`);
  console.log(`   GET    http://localhost:${PORT}/api/questions/subjects`);
  console.log(`   GET    http://localhost:${PORT}/api/questions`);
  console.log(`   POST   http://localhost:${PORT}/api/questions`);
  console.log(`   PUT    http://localhost:${PORT}/api/questions/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/questions/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/answers/question/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/answers/question/:id`);
});

module.exports = app;
