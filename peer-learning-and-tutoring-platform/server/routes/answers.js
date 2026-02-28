const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');

// Public routes
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const answers = await Answer.find({ question: questionId });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const count = await Answer.countDocuments();
    res.json({ totalAnswers: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question', 'title');
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch answer' });
  }
});

// Protected routes (temporarily without auth for testing)
router.post('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { body } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answer = new Answer({
      body,
      question: questionId,
      author: '507f1f77bcf86cd799439012' // Mock user ID
    });

    await answer.save();
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

module.exports = router;
