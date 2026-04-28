const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const answerController = require('../controllers/answerController');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

const notifyQuestionAuthor = async ({ question, answer, status, tutorComment, tutor }) => {
  if (!question?.author || question.author.toString() === tutor._id.toString()) return;

  try {
    const tutorName = tutor.username || tutor.profile?.firstName || 'A tutor';
    const isCorrect = status === 'correct';

    await Notification.create({
      userId: question.author,
      type: isCorrect ? 'success' : 'info',
      title: isCorrect ? 'Your answer was reviewed' : 'New tutor answer',
      message: `${tutorName} posted an answer for "${question.title}".`,
      data: {
        questionId: question._id,
        answerId: answer._id,
        status,
        tutorComment
      },
      actionUrl: `/forum/${question._id}`,
      priority: 'normal'
    });
  } catch (error) {
    console.error('Answer notification error:', error.message);
  }
};

const createAnswerForQuestion = async (req, res, questionId) => {
  const { status = 'pending', tutorComment, marks } = req.body;
  const body = req.body.body || req.body.answer;

  if (!body?.trim()) {
    return res.status(400).json({ error: 'Answer body is required' });
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const answer = new Answer({
    body,
    question: questionId,
    author: req.user._id,
    status,
    tutorComment,
    isAccepted: status === 'correct',
    acceptedBy: status === 'correct' ? req.user._id : undefined,
    acceptedAt: status === 'correct' ? new Date() : undefined
  });

  await answer.save();

  const questionUpdate = {
    correctAnswer: body,
    explanation: tutorComment || '',
    hasAcceptedAnswer: status === 'correct'
  };
  if (marks !== undefined && marks !== '') {
    questionUpdate.points = Number(marks);
  }
  await Question.findByIdAndUpdate(questionId, questionUpdate);

  const populatedAnswer = await Answer.findById(answer._id)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('acceptedBy', 'username profile.firstName profile.lastName');

  await notifyQuestionAuthor({
    question,
    answer: populatedAnswer,
    status,
    tutorComment,
    tutor: req.user
  });

  return res.status(201).json(populatedAnswer);
};

// Moderation route (admin/moderator)
router.get('/moderation/all', authenticate, authorize('admin', 'moderator'), answerController.listAnswersForModeration);

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
router.post('/', authenticate, async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }
    return createAnswerForQuestion(req, res, questionId);
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

router.post('/question/:questionId', authenticate, async (req, res) => {
  try {
    const { questionId } = req.params;
    return createAnswerForQuestion(req, res, questionId);
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, tutorComment } = req.body;
    const answer = await Answer.findByIdAndUpdate(
      req.params.id,
      {
        status,
        tutorComment,
        isAccepted: status === 'correct',
        acceptedBy: status === 'correct' ? req.user._id : undefined,
        acceptedAt: status === 'correct' ? new Date() : undefined
      },
      { returnDocument: 'after', runValidators: true }
    )
      .populate('question', 'title author')
      .populate('author', 'username profile.firstName profile.lastName profile.avatar');

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    await notifyQuestionAuthor({
      question: answer.question,
      answer,
      status,
      tutorComment,
      tutor: req.user
    });

    res.json(answer);
  } catch (error) {
    console.error('Update answer status error:', error);
    res.status(500).json({ error: 'Failed to update answer status' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.marks;

    if (updateData.status === 'correct') {
      updateData.isAccepted = true;
      updateData.acceptedBy = req.user._id;
      updateData.acceptedAt = new Date();
    }

    const answer = await Answer.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true
    })
      .populate('question', 'title author')
      .populate('author', 'username profile.firstName profile.lastName profile.avatar');
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (req.body.body || req.body.tutorComment || req.body.marks !== undefined || req.body.status) {
      const questionUpdate = {};
      if (req.body.body) questionUpdate.correctAnswer = req.body.body;
      if (req.body.tutorComment !== undefined) questionUpdate.explanation = req.body.tutorComment;
      if (req.body.marks !== undefined && req.body.marks !== '') questionUpdate.points = Number(req.body.marks);
      if (req.body.status) questionUpdate.hasAcceptedAnswer = req.body.status === 'correct';
      await Question.findByIdAndUpdate(answer.question._id || answer.question, questionUpdate);
    }

    if (req.body.status || req.body.tutorComment) {
      await notifyQuestionAuthor({
        question: answer.question,
        answer,
        status: answer.status,
        tutorComment: answer.tutorComment,
        tutor: req.user
      });
    }

    res.json(answer);
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const canDelete = answer.author.toString() === req.user._id.toString()
      || ['admin', 'websiteAdmin', 'superadmin', 'moderator'].includes(req.user.role);
    if (!canDelete) {
      return res.status(403).json({ error: 'You cannot delete this answer' });
    }

    const questionId = answer.question;
    await Answer.findByIdAndDelete(answer._id);

    const [answerCount, acceptedAnswer] = await Promise.all([
      Answer.countDocuments({ question: questionId }),
      Answer.findOne({ question: questionId, isAccepted: true }).sort({ updatedAt: -1 })
    ]);

    const questionUpdate = {
      answerCount,
      hasAcceptedAnswer: !!acceptedAnswer
    };

    if (acceptedAnswer) {
      questionUpdate.correctAnswer = acceptedAnswer.body;
      questionUpdate.explanation = acceptedAnswer.tutorComment || '';
    } else if (answer.isAccepted || answerCount === 0) {
      questionUpdate.correctAnswer = '';
      questionUpdate.explanation = '';
    }

    await Question.findByIdAndUpdate(questionId, questionUpdate);

    res.json({ success: true, message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

module.exports = router;
