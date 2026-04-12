const Tutor = require('../models/Tutor');
const User = require('../models/User');

// @desc    Become a tutor
// @route   POST /api/tutors
// @access  Private (User)
exports.registerTutor = async (req, res) => {
  const { subjects, bio, education, experience, hourlyRate, availability, alStream } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let tutor = await Tutor.findOne({ userId: req.user._id });
    
    if (tutor) {
      // Update existing tutor profile
      tutor.subjects = subjects || tutor.subjects;
      tutor.bio = bio || tutor.bio;
      tutor.education = education || tutor.education;
      tutor.experience = experience || tutor.experience;
      tutor.hourlyRate = hourlyRate || tutor.hourlyRate;
      tutor.availability = availability || tutor.availability;
      
      const updatedTutor = await tutor.save();
      return res.status(200).json(updatedTutor);
    }

    // Create new tutor profile
    tutor = await Tutor.create({
      userId: req.user._id,
      subjects,
      bio,
      education,
      experience,
      hourlyRate,
      availability,
      alStream
    });

    res.status(201).json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved tutors
// @route   GET /api/tutors
// @access  Public
exports.getTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ verificationStatus: 'approved' })
      .populate('userId', 'username email profile.firstName profile.lastName profile.avatar');
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tutor profile
// @route   GET /api/tutors/:id
// @access  Public
exports.getTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('userId', 'username email profile.firstName profile.lastName profile.avatar');

    if (tutor) {
      res.json(tutor);
    } else {
      res.status(404).json({ message: 'Tutor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tutor profile by User ID
// @route   GET /api/tutors/user/:userId
// @access  Public
exports.getTutorByUserId = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.params.userId })
      .populate('userId', 'username email profile.firstName profile.lastName profile.avatar');

    if (tutor) {
      res.json(tutor);
    } else {
      res.status(404).json({ message: 'Tutor profile not found for this user' });
    }
  } catch (error) {
    console.error('getTutorByUserId Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tutors (for admin)
// @route   GET /api/tutors/all
// @access  Private (Admin)
exports.getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find()
      .populate('userId', 'username email profile.firstName profile.lastName profile.avatar');
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Moderate tutor registration
// @route   PUT /api/tutors/:id/moderate
// @access  Private (Admin)
exports.moderateTutor = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const tutor = await Tutor.findById(req.params.id);

    if (tutor) {
      tutor.verificationStatus = status;
      const updatedTutor = await tutor.save();
      
      // Update user role to tutor if approved
      if (status === 'approved') {
        const user = await User.findById(tutor.userId);
        if (user) {
          user.role = 'tutor';
          await user.save();
        }
      }
      
      res.json(updatedTutor);
    } else {
      res.status(404).json({ message: 'Tutor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
