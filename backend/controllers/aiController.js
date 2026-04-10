const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');

// @desc    Smart Tutor Matcher
// @route   POST /api/ai/match
// @access  Private (Student)
exports.matchTutor = async (req, res) => {
  const { stream, subject, grade } = req.body;
  const searchStream = stream || subject;

  try {
    // Find tutors in the specified stream/subject who are approved
    const tutors = await Tutor.find({
      $or: [
        { alStream: searchStream },
        { subjects: { $in: [searchStream] } }
      ],
      verificationStatus: 'approved'
    }).populate('userId', 'username profile.firstName profile.lastName profile.avatar');

    // Simulate AI ranking logic (featured first, then rating)
    const rankedTutors = tutors.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    });

    res.json(rankedTutors);
  } catch (error) {
    console.error('Match Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Session Insights
// @route   GET /api/ai/session-insights/:sessionId
// @access  Private
exports.getSessionInsights = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.sessionId);
    if (!booking) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Mock AI insights logic
    res.json({
      summary: "The session focused on advanced calculus concepts, specifically limits and derivatives.",
      keyTakeaways: [
        "Mastered the definition of a limit.",
        "Understood the power rule for derivatives.",
        "Needs more practice with the chain rule."
      ],
      suggestedResources: [
        "Calculus: Early Transcendentals, Chapter 3",
        "Khan Academy: Chain Rule Practice"
      ],
      autoFlashcards: [
        { front: "What is the power rule?", back: "d/dx [x^n] = n * x^(n-1)" },
        { front: "What is a limit?", back: "The value that a function approaches as the input approaches some value." }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
