const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const Material = require('../models/Material');
const Report = require('../models/Report');

const seedUsers = [
  {
    username: 'ahsan_student',
    email: 'student@peerlearn.com',
    password: 'password123',
    role: 'student',
    district: 'Colombo',
    stream: 'Combined Maths',
    grade: 'A/L 2025',
    profile: {
      firstName: 'Ahsan',
      lastName: 'Mohammed',
      bio: 'Aspiring engineer from Colombo focused on mastering Higher Mathematics.'
    },
    gamification: {
      points: 1250,
      level: 4,
      streak: 7,
      badges: ['Calculus Conqueror', 'Biology Ace']
    }
  },
  {
    username: 'saritha_tutor',
    email: 'tutor@peerlearn.com',
    password: 'password123',
    role: 'tutor',
    district: 'Gampaha',
    stream: 'Combined Maths',
    profile: {
      firstName: 'Saritha',
      lastName: 'Munasinghe',
      bio: 'B.Sc Engineering (Honors) at University of Moratuwa. Teaching Physics & Maths for 5 years.'
    }
  },
  {
    username: 'kumar_tutor',
    email: 'kumar@peerlearn.com',
    password: 'password123',
    role: 'tutor',
    district: 'Kandy',
    stream: 'Biology',
    profile: {
      firstName: 'Kumar',
      lastName: 'Sangakkara',
      bio: 'Medical student at University of Peradeniya. Passionate about Biology and Chemistry.'
    }
  },
  {
    username: 'admin_user',
    email: 'admin@peerlearn.com',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Platform',
      lastName: 'Admin',
      bio: 'Senior PeerLearn Moderator.'
    }
  },
  {
    username: 'super_admin',
    email: 'super@peerlearn.com',
    password: 'password123',
    role: 'superadmin',
    profile: {
      firstName: 'System',
      lastName: 'Architect',
      bio: 'Full system oversight and security.'
    }
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/peerlearn';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Tutor.deleteMany({});
    await Booking.deleteMany({});
    await Material.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data.');

    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    const student = createdUsers.find(u => u.username === 'ahsan_student');
    const tutor1 = createdUsers.find(u => u.username === 'saritha_tutor');
    const tutor2 = createdUsers.find(u => u.username === 'kumar_tutor');
    const admin = createdUsers.find(u => u.username === 'admin_user');

    // Create Tutor Profiles
    const tutorProfile1 = await Tutor.create({
      userId: tutor1._id,
      subjects: ['Combined Maths', 'Physics'],
      alStream: 'Combined Maths',
      bio: 'B.Sc Engineering (Honors) at University of Moratuwa. Teaching Physics & Maths for 5 years.',
      education: [{
        institution: 'University of Moratuwa',
        degree: 'B.Sc. Engineering (Honors)',
        year: 2022
      }],
      experience: 5,
      rating: 4.9,
      reviewCount: 42,
      verificationStatus: 'approved',
      hourlyRate: 1500,
      isFeatured: true
    });

    const tutorProfile2 = await Tutor.create({
      userId: tutor2._id,
      subjects: ['Biology', 'Chemistry'],
      alStream: 'Biology',
      bio: 'Medical student at University of Peradeniya. Passionate about Biology and Chemistry.',
      education: [{
        institution: 'University of Peradeniya',
        degree: 'MBBS (Reading)',
        year: 2026
      }],
      experience: 2,
      rating: 4.5,
      reviewCount: 12,
      verificationStatus: 'pending',
      hourlyRate: 1200,
      isFeatured: false
    });

    // Create Materials
    const material1 = await Material.create({
      title: 'Advanced Calculus Integration Techniques',
      description: 'Comprehensive guide for A/L Combined Maths integration problems.',
      fileUrl: '/uploads/calculus_guide.pdf',
      fileType: 'pdf',
      uploaderId: tutor1._id,
      subject: 'Combined Maths',
      grade: 'A/L 2025',
      price: 500,
      isApproved: true,
      moderationStatus: 'approved',
      tags: ['Calculus', 'Maths', 'A/L'],
      downloads: 120,
      trustScore: 95
    });

    const material2 = await Material.create({
      title: 'Organic Chemistry Reactions Summary',
      description: 'Handwritten notes covering all mandatory organic reactions.',
      fileUrl: '/uploads/organic_chem.pdf',
      fileType: 'pdf',
      uploaderId: tutor2._id,
      subject: 'Chemistry',
      grade: 'A/L 2025',
      price: 350,
      isApproved: false,
      moderationStatus: 'pending',
      tags: ['Chemistry', 'A/L', 'Organic'],
      downloads: 0,
      trustScore: 40
    });

    // Create Bookings for Ahsan
    await Booking.create({
      tutorId: tutorProfile1._id,
      studentId: student._id,
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '16:00',
      endTime: '18:00',
      status: 'confirmed',
      subject: 'Combined Maths: Integration',
      meetingUrl: 'https://peerlearn.live/math-session-001',
      price: 3000,
      paymentStatus: 'paid'
    });

    await Booking.create({
      tutorId: tutorProfile1._id,
      studentId: student._id,
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      startTime: '14:00',
      endTime: '15:30',
      status: 'pending',
      subject: 'Physics: Mechanics',
      price: 2250,
      paymentStatus: 'pending'
    });

    // Create Reports
    await Report.create({
      reporterId: student._id,
      targetId: material1._id,
      targetType: 'Material',
      reason: 'Inappropriate Content',
      description: 'The material contains some irrelevant political commentary in the notes.',
      status: 'pending',
      suspicionScore: 15
    });

    await Report.create({
      reporterId: student._id,
      targetId: tutor2._id,
      targetType: 'User',
      reason: 'Unprofessional Behavior',
      description: 'The tutor failed to join the trial session twice without notice.',
      status: 'pending',
      suspicionScore: 85
    });

    console.log('Successfully seeded all platform roles, tutor profiles, materials, bookings, and reports!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
