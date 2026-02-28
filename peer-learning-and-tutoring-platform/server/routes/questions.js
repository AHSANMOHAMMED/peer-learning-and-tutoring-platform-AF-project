const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Public routes
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().limit(10);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.json({ totalQuestions: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/subjects', (req, res) => {
  res.json({ subjects: ['Mathematics', 'Science', 'History', 'Geography', 'English'] });
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Protected routes (temporarily without auth for testing)
router.post('/', async (req, res) => {
  try {
    const { title, body, subject, grade, tags } = req.body;
    const question = new Question({
      title,
      body,
      subject,
      grade,
      tags,
      author: '507f1f77bcf86cd799439011' // Mock user ID
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
