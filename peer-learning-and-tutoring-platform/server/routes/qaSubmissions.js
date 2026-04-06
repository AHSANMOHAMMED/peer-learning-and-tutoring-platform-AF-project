const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const QASubmission = require('../models/QASubmission');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

router.post(
  '/',
  [
    authenticate,
    body('questionId').isString().notEmpty(),
    body('questionTitle').isString().trim().notEmpty(),
    body('subject').isString().trim().notEmpty(),
    body('grade').isInt({ min: 6, max: 13 }),
    body('type').optional().isIn(['mcq', 'structured', 'essay']),
    body('answer').isString().trim().notEmpty(),
    body('points').optional().isNumeric(),
    body('marks').optional().isNumeric(),
    body('feedback').optional().isString(),
    validate,
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({
          success: false,
          message: 'Only students can submit answers.',
        });
      }

      const submission = await QASubmission.create({
        questionId: req.body.questionId,
        studentId: req.user._id,
        studentName:
          req.user.displayName ||
          `${req.user.profile?.firstName || ''} ${req.user.profile?.lastName || ''}`.trim() ||
          req.user.username ||
          'Student',
        questionTitle: req.body.questionTitle,
        subject: req.body.subject,
        grade: Number(req.body.grade),
        type: req.body.type || 'structured',
        answer: req.body.answer,
        points: Number(req.body.points || 0),
        marks: Number(req.body.marks || 0),
        feedback: req.body.feedback || '',
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : new Date(),
      });

      return res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Error creating QA submission:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create submission',
      });
    }
  }
);

router.get(
  '/',
  [
    authenticate,
    query('grade').optional().isInt({ min: 6, max: 13 }),
    query('subject').optional().isString(),
    validate,
  ],
  async (req, res) => {
    try {
      if (!['tutor', 'admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only tutors/admins can view submissions.',
        });
      }

      const query = {};

      if (req.user.role === 'tutor') {
        query.grade = Number(req.user.profile?.grade);
      } else if (req.query.grade) {
        query.grade = Number(req.query.grade);
      }

      if (req.query.subject && req.query.subject !== 'All') {
        query.subject = req.query.subject;
      }

      const submissions = await QASubmission.find(query)
        .sort({ submittedAt: -1 })
        .limit(500)
        .lean();

      return res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error('Error fetching QA submissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions',
      });
    }
  }
);

router.get(
  '/admin/qa-overview',
  [
    authenticate,
    query('grade').optional().isInt({ min: 6, max: 13 }),
    query('subject').optional().isString(),
    validate,
  ],
  async (req, res) => {
    try {
      if (!['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admins/moderators can view QA overview.',
        });
      }

      const gradeFilter = req.query.grade ? Number(req.query.grade) : null;
      const subjectFilter = req.query.subject && req.query.subject !== 'All' ? req.query.subject : null;

      const submissionQuery = {};
      if (gradeFilter) submissionQuery.grade = gradeFilter;
      if (subjectFilter) submissionQuery.subject = subjectFilter;

      const submissions = await QASubmission.find(submissionQuery).sort({ submittedAt: -1 }).limit(2000).lean();

      const studentMap = new Map();
      for (const row of submissions) {
        const studentName = row.studentName || 'Student';
        const key = `${studentName}::${row.subject}::${row.grade}`;
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentName,
            subject: row.subject,
            grade: row.grade,
            attempts: 0,
            marks: 0,
            points: 0,
            averageScore: 0,
          });
        }

        const acc = studentMap.get(key);
        acc.attempts += 1;
        acc.marks += Number(row.marks || 0);
        acc.points += Number(row.points || 0);
      }

      const studentPerformance = Array.from(studentMap.values()).map((item) => ({
        ...item,
        averageScore: item.points > 0 ? Number(((item.marks / item.points) * 100).toFixed(1)) : 0,
      }));

      const questionQuery = {};
      if (gradeFilter) questionQuery.grade = gradeFilter;
      if (subjectFilter) questionQuery.subject = subjectFilter;

      const questions = await Question.find(questionQuery)
        .populate('author', 'username role profile.firstName profile.lastName')
        .lean();

      const tutorQuestionMap = new Map();
      for (const question of questions) {
        if (question?.author?.role !== 'tutor') continue;
        const tutorName = `${question.author?.profile?.firstName || ''} ${question.author?.profile?.lastName || ''}`.trim() || question.author?.username || 'Tutor';
        const key = `${question.author._id}::${question.grade}::${question.subject}`;
        if (!tutorQuestionMap.has(key)) {
          tutorQuestionMap.set(key, {
            tutorId: String(question.author._id),
            tutorName,
            grade: question.grade,
            subject: question.subject,
            questionsCreated: 0,
          });
        }
        tutorQuestionMap.get(key).questionsCreated += 1;
      }

      const answers = await Answer.find({})
        .populate('author', 'username role profile.firstName profile.lastName')
        .populate('question', 'grade subject')
        .lean();

      const tutorAnswerMap = new Map();
      for (const answer of answers) {
        if (answer?.author?.role !== 'tutor') continue;
        if (!answer.question) continue;
        if (gradeFilter && Number(answer.question.grade) !== gradeFilter) continue;
        if (subjectFilter && answer.question.subject !== subjectFilter) continue;

        const tutorName = `${answer.author?.profile?.firstName || ''} ${answer.author?.profile?.lastName || ''}`.trim() || answer.author?.username || 'Tutor';
        const key = `${answer.author._id}::${answer.question.grade}::${answer.question.subject}`;

        if (!tutorAnswerMap.has(key)) {
          tutorAnswerMap.set(key, {
            tutorId: String(answer.author._id),
            tutorName,
            grade: answer.question.grade,
            subject: answer.question.subject,
            answersProvided: 0,
            acceptedAnswers: 0,
            correctStatusAnswers: 0,
          });
        }

        const acc = tutorAnswerMap.get(key);
        acc.answersProvided += 1;
        if (answer.isAccepted) acc.acceptedAnswers += 1;
        if (answer.status === 'correct') acc.correctStatusAnswers += 1;
      }

      const tutorQuestionActivity = Array.from(tutorQuestionMap.values()).sort((a, b) => b.questionsCreated - a.questionsCreated);
      const tutorAnswerActivity = Array.from(tutorAnswerMap.values()).sort((a, b) => b.answersProvided - a.answersProvided);

      const uniqueStudents = new Set(submissions.map((s) => s.studentId?.toString()).filter(Boolean));
      const uniqueTutors = new Set([
        ...tutorQuestionActivity.map((t) => t.tutorId),
        ...tutorAnswerActivity.map((t) => t.tutorId),
      ]);

      return res.json({
        success: true,
        data: {
          overview: {
            totalSubmissions: submissions.length,
            uniqueStudents: uniqueStudents.size,
            uniqueTutors: uniqueTutors.size,
            totalQuestionsByTutors: tutorQuestionActivity.reduce((sum, item) => sum + item.questionsCreated, 0),
            totalAnswersByTutors: tutorAnswerActivity.reduce((sum, item) => sum + item.answersProvided, 0),
          },
          studentPerformance,
          tutorQuestionActivity,
          tutorAnswerActivity,
        },
      });
    } catch (error) {
      console.error('Error fetching admin QA overview:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch admin QA overview',
      });
    }
  }
);

module.exports = router;
