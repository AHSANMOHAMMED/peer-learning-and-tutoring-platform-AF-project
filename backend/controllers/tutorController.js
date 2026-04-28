const Tutor = require('../models/Tutor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EmailService = require('../services/emailService');
const mongoose = require('mongoose');

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
      tutor.alStream = alStream || tutor.alStream;
      tutor.expertise = req.body.expertise || tutor.expertise;
      if (tutor.verificationStatus === 'not_created' || tutor.verificationStatus === 'rejected') {
        tutor.verificationStatus = 'pending';
        tutor.rejectionReason = undefined;
        tutor.verificationNotes = undefined;
      }
      
      const updatedTutor = await tutor.save();
      const publicUser = user.toPublicJSON ? user.toPublicJSON() : user.toObject();
      publicUser.isPendingApproval = true;
      publicUser.verificationStatus = updatedTutor.verificationStatus;

      return res.status(200).json({
        success: true,
        message: 'Tutor application updated and submitted for review',
        data: updatedTutor,
        tutor: updatedTutor,
        user: publicUser
      });
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
      alStream,
      expertise: req.body.expertise,
      verificationStatus: 'pending'
    });

    const publicUser = user.toPublicJSON ? user.toPublicJSON() : user.toObject();
    publicUser.isPendingApproval = true;
    publicUser.verificationStatus = tutor.verificationStatus;

    res.status(201).json({
      success: true,
      message: 'Tutor application submitted for review',
      data: tutor,
      tutor,
      user: publicUser
    });
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(404).json({ message: 'Tutor profile not found for this user' });
    }

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
  const { verificationStatus, reason, notes } = req.body;
  const status = req.body.status || verificationStatus; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'A valid moderation status is required' });
    }

    const tutor = await Tutor.findById(req.params.id).populate('userId');

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    tutor.verificationStatus = status;
    if (status === 'approved') {
      tutor.verifiedBy = req.user._id;
      tutor.verifiedAt = new Date();
      tutor.verificationNotes = notes;
    } else {
      tutor.rejectedBy = req.user._id;
      tutor.rejectedAt = new Date();
      tutor.rejectionReason = reason;
      tutor.rejectionNotes = notes;
    }

    const updatedTutor = await tutor.save();
    
    // Update user role and send notifications
    const user = await User.findById(tutor.userId);
    if (user) {
      if (status === 'approved') {
        user.role = 'tutor';
        await user.save();

        // Notifications
        try {
          await Notification.create({
            userId: user._id,
            title: 'Tutor Application Approved',
            message: 'Congratulations! Your application to become a tutor has been approved.',
            type: 'success',
            link: '/tutor-dashboard'
          });
          await EmailService.sendTutorApprovedEmail(user.email, user.username);
        } catch (notifyErr) {
          console.error('Notification error (approval):', notifyErr);
        }
      } else {
        // Notifications (rejection)
        try {
          await Notification.create({
            userId: user._id,
            title: 'Tutor Application Update',
            message: `Your tutor application was rejected. Reason: ${reason || 'Incomplete profile'}`,
            type: 'error',
            link: '/profile/setup'
          });
          await EmailService.sendTutorRejectedEmail(user.email, user.username, reason);
        } catch (notifyErr) {
          console.error('Notification error (rejection):', notifyErr);
        }
      }
    }
    
    res.json(updatedTutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update tutor professional profile
// @route   PUT /api/tutors/:id
// @access  Private (Tutor)
exports.updateTutorProfile = async (req, res) => {
  const { bio, hourlyRate, experience, subjects, education, availability, expertise } = req.body;

  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Authorization check: User can only update their own tutor profile
    if (tutor.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    tutor.bio = bio !== undefined ? bio : tutor.bio;
    tutor.hourlyRate = hourlyRate !== undefined ? hourlyRate : tutor.hourlyRate;
    tutor.experience = experience !== undefined ? experience : tutor.experience;
    tutor.subjects = subjects !== undefined ? subjects : tutor.subjects;
    tutor.education = education !== undefined ? education : tutor.education;
    tutor.availability = availability !== undefined ? availability : tutor.availability;
    tutor.expertise = expertise !== undefined ? expertise : tutor.expertise;

    const updatedTutor = await tutor.save();
    res.json(updatedTutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
