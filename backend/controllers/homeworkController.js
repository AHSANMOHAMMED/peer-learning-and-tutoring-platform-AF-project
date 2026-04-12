const HomeworkSubmission = require('../models/HomeworkSubmission');
const UserGamification = require('../models/UserGamification');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc    Submit homework (Student)
 * @route   POST /api/homework/submit
 * @access  Private (Student)
 */
exports.submitHomework = async (req, res) => {
  try {
    const { tutorId, title, description, subject, grade, files } = req.body;
    
    if (!tutorId || !title || !subject || !grade) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const submission = await HomeworkSubmission.create({
      student: req.user._id,
      tutor: tutorId,
      title,
      description,
      subject,
      grade,
      submittedFiles: files || [],
      status: 'submitted'
    });

    // Notify tutor
    await Notification.create({
      recipient: tutorId,
      sender: req.user._id,
      type: 'homework_submitted',
      title: 'New Homework Submission',
      message: `${req.user.username} submitted homework: ${title}`,
      relatedId: submission._id,
      modelType: 'HomeworkSubmission'
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error('Submit Homework Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get tutor's pending homework
 * @route   GET /api/homework/tutor/pending
 * @access  Private (Tutor)
 */
exports.getTutorPendingHomework = async (req, res) => {
  try {
    const homework = await HomeworkSubmission.find({ 
      tutor: req.user._id, 
      status: 'submitted' 
    }).populate('student', 'username profile.firstName profile.lastName profile.avatar');
    
    res.json({ success: true, count: homework.length, data: homework });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Grade homework (Tutor)
 * @route   PUT /api/homework/grade/:id
 * @access  Private (Tutor)
 */
exports.gradeHomework = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submissionId = req.params.id;

    if (marks === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide marks' });
    }

    const submission = await HomeworkSubmission.findOne({ _id: submissionId, tutor: req.user._id });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Homework submission not found' });
    }

    submission.marks = marks;
    submission.tutorFeedback = feedback;
    submission.status = 'marked';
    submission.markedAt = new Date();
    
    // Calculate points: eg. marks * 10
    const pointsAwarded = marks * 10;
    submission.pointsAwarded = pointsAwarded;
    
    await submission.save();

    // Update Student Gamification
    let gamification = await UserGamification.findOne({ user: submission.student });
    if (!gamification) {
      gamification = await UserGamification.create({ user: submission.student });
    }
    
    gamification.addPoints(pointsAwarded, 'homework');
    gamification.updateStreak();
    await gamification.save();

    // Notify student
    await Notification.create({
      recipient: submission.student,
      sender: req.user._id,
      type: 'homework_graded',
      title: 'Homework Graded!',
      message: `Your homework "${submission.title}" has been marked. You earned ${pointsAwarded} points!`,
      relatedId: submission._id,
      modelType: 'HomeworkSubmission'
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Grade Homework Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get student homework history
 * @route   GET /api/homework/student/history
 * @access  Private (Student)
 */
exports.getStudentHistory = async (req, res) => {
  try {
    const history = await HomeworkSubmission.find({ student: req.user._id })
      .populate('tutor', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
