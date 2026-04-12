const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const aiHomeworkAssistant = require('../services/AIHomeworkAssistant');

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

    // Use real AI to generate session insights
    const prompt = `Based on this session booking, generate a summary, 3 key takeaways, 2 suggested resources, and 2 flashcards.
    Session Details:
    - Subject: ${booking.subject}
    - Topic: ${booking.topic || 'General'}
    - Duration: ${booking.duration} mins
    
    Format the response as a valid JSON object:
    {
      "summary": "...",
      "keyTakeaways": ["...", "...", "..."],
      "suggestedResources": ["...", "..."],
      "autoFlashcards": [{"front": "...", "back": "..."}, {"front": "...", "back": "..."}]
    }`;

    try {
      const aiResponse = await aiHomeworkAssistant.callAI(`You are an educational analyst.`, [{ role: 'user', content: prompt }]);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
         return res.json(JSON.parse(jsonMatch[0]));
      }
      
      throw new Error('Could not parse AI response');
    } catch (aiError) {
      console.error('AI Insights generation error:', aiError);
      // Fallback if AI fails
      res.json({
        summary: `Session about ${booking.subject}: ${booking.topic || 'General'}.`,
        keyTakeaways: ["Reviewed core concepts", "Discussed practical examples"],
        suggestedResources: ["Check textbook chapter related to " + booking.subject],
        autoFlashcards: []
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
