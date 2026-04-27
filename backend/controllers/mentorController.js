const Mentor = require('../models/Mentor');
const User = require('../models/User');

// Register as mentor
exports.registerMentor = async (req, res) => {
  const { expertise, bio, qualifications, experienceYears, availability, mentorshipAreas } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let mentor = await Mentor.findOne({ userId: req.user._id });
    if (mentor) {
      // Update existing
      mentor.expertise = expertise || mentor.expertise;
      mentor.bio = bio || mentor.bio;
      mentor.qualifications = qualifications || mentor.qualifications;
      mentor.experienceYears = experienceYears || mentor.experienceYears;
      mentor.availability = availability || mentor.availability;
      mentor.mentorshipAreas = mentorshipAreas || mentor.mentorshipAreas;
      const updated = await mentor.save();
      return res.json(updated);
    }

    mentor = await Mentor.create({
      userId: req.user._id,
      expertise,
      bio,
      qualifications,
      experienceYears,
      availability,
      mentorshipAreas
    });

    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all approved mentors
exports.getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ verificationStatus: 'approved' })
      .populate('userId', 'username email profile');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mentor profile by ID
exports.getMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('userId', 'username email profile');
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update mentor profile
exports.updateMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    // Only allow mentor to update own profile
    if (mentor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(mentor, req.body);
    const updated = await mentor.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Moderate mentor (verify/suspend)
exports.moderateMentor = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    );
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
