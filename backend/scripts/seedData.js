const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const Material = require('../models/Material');
const Report = require('../models/Report');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const Timetable = require('../models/Timetable');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const PointTransaction = require('../models/PointTransaction');
const FeatureFlag = require('../models/FeatureFlag');
const School = require('../models/School');

const seedUsers = [
  {
    username: 'nimal_student',
    email: 'nimal@peerlearn.lk',
    password: 'password123',
    role: 'student',
    district: 'Colombo',
    stream: 'Combined Mathematics',
    grade: 'A/L 2025',
    profile: { firstName: 'Nimal', lastName: 'Perera', bio: 'A/L Maths student from Royal College.' },
    gamification: { points: 1250, level: 4, streak: 7, badges: [] }
  },
  {
    username: 'kamal_tutor',
    email: 'kamal@peerlearn.lk',
    password: 'password123',
    role: 'tutor',
    district: 'Colombo',
    stream: 'Combined Mathematics',
    profile: { firstName: 'Kamal', lastName: 'Silva', bio: 'B.Sc Engineering (Honors) at University of Moratuwa.' }
  },
  {
    username: 'ruwanthi_student',
    email: 'ruwanthi@peerlearn.lk',
    password: 'password123',
    role: 'student',
    district: 'Kandy',
    stream: 'Biological Sciences',
    grade: 'A/L 2024',
    profile: { firstName: 'Ruwanthi', lastName: 'Jayasooriya', bio: 'Aiming for Medical College.' },
    gamification: { points: 600, level: 2, streak: 3, badges: [] }
  },
  {
    username: 'dinithi_tutor',
    email: 'dinithi@peerlearn.lk',
    password: 'password123',
    role: 'tutor',
    district: 'Kandy',
    stream: 'Biological Sciences',
    profile: { firstName: 'Dinithi', lastName: 'Fernando', bio: 'MBBS (Reading) at University of Peradeniya.' }
  },
  {
    username: 'amil_parent',
    email: 'amil@peerlearn.lk',
    password: 'password123',
    role: 'parent',
    profile: { firstName: 'Amil', lastName: 'Perera', bio: 'Parent of Nimal.' }
  },
  {
    username: 'admin_lk',
    email: 'admin@peerlearn.lk',
    password: 'admin123',
    role: 'superadmin',
    profile: { firstName: 'System', lastName: 'Administrator', bio: 'Platform Admin' }
  },
  {
    username: 'admin_user',
    email: 'adminuser@peerlearn.lk',
    password: 'admin123',
    role: 'websiteAdmin',
    profile: { firstName: 'Admin', lastName: 'User', bio: 'Platform administrator with full management access.' }
  },
  {
    username: 'mod_user',
    email: 'mod@peerlearn.lk',
    password: 'password123',
    role: 'moderator',
    profile: { firstName: 'Mod', lastName: 'Fernando', bio: 'Content moderator for the platform.' }
  },
  {
    username: 'school_admin',
    email: 'school@peerlearn.lk',
    password: 'password123',
    role: 'schoolAdmin',
    district: 'Colombo',
    profile: { firstName: 'School', lastName: 'Admin', bio: 'Royal College school administrator.' }
  }
];

const seedBadges = [
  { name: 'O/L Master', description: 'Solved 100 O/L papers', icon: '🎓', category: 'milestone', rarity: 'rare', tier: 2, criteria: { type: 'points', value: 1000 } },
  { name: 'A/L Scholar', description: 'Scored top marks in A/L Mock Exams', icon: '🏆', category: 'quality', rarity: 'legendary', tier: 5, criteria: { type: 'points', value: 5000 } },
  { name: 'Moratuwa Material', description: 'Earned 10,000 points in Combined Mathematics', icon: '⚙️', category: 'subject_mastery', rarity: 'epic', tier: 4, criteria: { type: 'points', value: 10000, subject: 'Combined Mathematics' } }
];

const seedSchools = [
  { name: 'Royal College', code: 'RC001', email: 'info@royalcollege.lk', type: 'government', levels: ['secondary', 'advanced_level'], grades: [6,7,8,9,10,11,12,13], address: { city: 'Colombo', district: 'Colombo' }, status: 'active' },
  { name: 'Visakha Vidyalaya', code: 'VV001', email: 'info@visakhav.lk', type: 'government', levels: ['secondary', 'advanced_level'], grades: [6,7,8,9,10,11,12,13], address: { city: 'Colombo', district: 'Colombo' }, status: 'active' },
  { name: 'Ananda College', code: 'AC001', email: 'info@ananda.lk', type: 'government', levels: ['secondary', 'advanced_level'], grades: [6,7,8,9,10,11,12,13], address: { city: 'Colombo', district: 'Colombo' }, status: 'active' }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peerlearn';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected. Executing Master Seeding Protocol...');

    await Promise.all([
      User.deleteMany({}), Tutor.deleteMany({}), Booking.deleteMany({}),
      Material.deleteMany({}), Report.deleteMany({}), Question.deleteMany({}),
      Answer.deleteMany({}), Vote.deleteMany({}), Timetable.deleteMany({}),
      Badge.deleteMany({}), UserBadge.deleteMany({}), PointTransaction.deleteMany({}),
      FeatureFlag.deleteMany({}), School.deleteMany({})
    ]);

    // 1. Badges
    const createdBadges = await Badge.insertMany(seedBadges);

    // 2. Schools
    await School.insertMany(seedSchools);

    // 3. Users
    const createdUsers = [];
    const otpCode = '123456';
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    for (const userData of seedUsers) {
      const user = await User.create({
        ...userData,
        otpCode,
        otpExpiry,
        isVerified: true
      });
      createdUsers.push(user);
    }
    const [nimal, kamal, ruwanthi, dinithi, amil, admin] = createdUsers;

    // 4. Feature Flags (Admin Default Setup)
    const flags = [
      { key: 'aiHomeworkEnabled', name: 'AI Homework Assistant', description: 'Enables multimodal AI homework support across the platform.', enabled: true, createdBy: admin._id },
      { key: 'voiceTutorEnabled', name: 'Voice Mentor API', description: 'Enables hands-free voice tutoring features.', enabled: true, createdBy: admin._id },
      { key: 'vrClassroomEnabled', name: 'Virtual VR Classroom', description: 'Enables 3D/VR virtual classroom environments.', enabled: true, createdBy: admin._id },
      { key: 'gamificationEnabled', name: 'Academic Gamification', description: 'Enables badge and point system.', enabled: true, createdBy: admin._id }
    ];
    await FeatureFlag.insertMany(flags);

    // 5. Gamification Transactions & User Badges
    await UserBadge.create({ user: nimal._id, badge: createdBadges[0]._id, awardedAt: new Date() });
    await PointTransaction.create({ user: nimal._id, action: 'daily_login', points: 5, subjectType: 'Course' });
    await PointTransaction.create({ user: kamal._id, action: 'answer_upvote_received', points: 10, subjectType: 'Answer' });

    // 6. Tutor Profiles
    const tutor1 = await Tutor.create({
      userId: kamal._id, subjects: ['Combined Mathematics', 'Physical Sciences'], alStream: 'Combined Mathematics',
      bio: 'B.Sc Engineering at Moratuwa. Specializes in Pure Maths.',
      education: [{ institution: 'University of Moratuwa', degree: 'B.Sc. Engineering', year: 2024 }],
      experience: 4, rating: 4.8, reviewCount: 75, verificationStatus: 'approved', hourlyRate: 2000, isFeatured: true
    });
    
    const tutor2 = await Tutor.create({
      userId: dinithi._id, subjects: ['Biological Sciences', 'Physical Sciences'], alStream: 'Biological Sciences',
      bio: 'Medical Student. I will teach you how to crack A/L Biology MCQs.',
      education: [{ institution: 'University of Peradeniya', degree: 'MBBS', year: 2026 }],
      experience: 3, rating: 4.9, reviewCount: 42, verificationStatus: 'approved', hourlyRate: 1500, isFeatured: false
    });

    // 7. Questions & Answers (English, Sinhala, Tamil)
    const q1 = await Question.create({
      title: 'How to solve 2022 A/L Combined Mathematics Integration Problem?',
      body: 'I am struggling with the substitution method on the second part of the essay question. Can someone explain?',
      tags: ['A/L', 'Maths', 'Integration'],
      subject: 'Combined Mathematics', grade: 13, author: nimal._id, difficulty: 'Hard'
    });

    await Answer.create({
      body: 'The trick is to use u = tan(x/2). This will simplify the denominator significantly. I have attached the steps.',
      question: q1._id, author: kamal._id, isAccepted: true, upvotes: 12
    });

    const q2 = await Question.create({
      title: 'Differences between C3 and C4 pathways in Photosynthesis?',
      body: 'What are the main morphological differences shown in leaf anatomy for A/L Biology?',
      tags: ['A/L', 'Biology', 'Botany'],
      subject: 'Biological Sciences', grade: 12, author: ruwanthi._id, difficulty: 'Medium'
    });

    await Answer.create({
      body: 'C4 plants exhibit Kranz anatomy, where the mesophyll cells are clustered around the bundle-sheath cells. This prevents photorespiration.',
      question: q2._id, author: dinithi._id, isAccepted: false, upvotes: 5
    });

    // Sinhala Question
    const q3 = await Question.create({
      title: 'අනුකලනය (Integration) මූලික සිද්ධාන්ත මොනවාද?',
      body: 'අනුකලනය ආරම්භ කිරීමේදී දැනගත යුතු වැදගත්ම සූත්‍ර මොනවාද? කරුණාකර පැහැදිලි කරන්න.',
      tags: ['Maths', 'Sinhala', 'Pure Maths'],
      subject: 'Combined Mathematics', grade: 12, author: nimal._id, difficulty: 'Easy'
    });

    await Answer.create({
      body: 'මූලිකවම ඔබ x^n, sin(x), cos(x) වැනි මූලික ශ්‍රිතවල අනුකලිත දැනගත යුතුය. එමෙන්ම අනුකලන නියතය (c) යෙදීමට අමතක නොකරන්න.',
      question: q3._id, author: kamal._id, isAccepted: true, upvotes: 8
    });

    // Tamil Question
    const q4 = await Question.create({
      title: 'ஒளித்தொகுப்பின் முக்கியத்துவம் என்ன?',
      body: 'தாவரங்களில் ஒளித்தொகுப்பு எவ்வாறு நடைபெறுகிறது? அதன் முக்கிய படிகளை விளக்குக.',
      tags: ['Biology', 'Tamil', 'Science'],
      subject: 'Biological Sciences', grade: 11, author: ruwanthi._id, difficulty: 'Medium'
    });

    await Answer.create({
      body: 'ஒளித்தொகுப்பு இரு நிலைகளில் நடைபெறுகிறது: ஒளி சார்ந்த வினை மற்றும் ஒளி சாரா வினை (கல்வின் வட்டம்).',
      question: q4._id, author: dinithi._id, isAccepted: true, upvotes: 10
    });

    await q1.updateAnswerCount();
    await q2.updateAnswerCount();
    await q3.updateAnswerCount();
    await q4.updateAnswerCount();

    // 8. Timetables
    await Timetable.create({
      userId: nimal._id, title: 'Combined Mathematics Revision', dayOfWeek: 1, startTime: '16:00', endTime: '18:00',
      type: 'study', description: 'Past paper module 1', isAvailable: false, color: '#3b82f6'
    });
    await Timetable.create({
      userId: ruwanthi._id, title: 'Biological Sciences Masterclass', dayOfWeek: 3, startTime: '14:30', endTime: '16:30',
      type: 'tutoring', description: 'With Dr. Dinithi', isAvailable: false, color: '#10b981'
    });

    // 9. Bookings
    await Booking.create({
      tutorId: tutor1._id, studentId: nimal._id, date: new Date(Date.now() + 86400000),
      startTime: '16:00', endTime: '18:00', status: 'confirmed', subject: 'Maths Integration',
      meetingUrl: '/session/math-integrations-1', price: 4000, paymentStatus: 'paid'
    });
    await Booking.create({
      tutorId: tutor2._id, studentId: ruwanthi._id, date: new Date(Date.now() - 172800000),
      startTime: '09:00', endTime: '11:00', status: 'completed', subject: 'Kranz Anatomy',
      meetingUrl: '/session/kranz-1', price: 3000, paymentStatus: 'paid'
    });

    // 10. Materials
    await Material.create({
      title: 'Moratuwa Engineering Physics Notes', description: 'Targeted for A/L 2025 Physics.',
      fileUrl: '/uploads/physics.pdf', fileType: 'pdf', uploaderId: tutor1._id, subject: 'Physical Sciences',
      grade: 'A/L 2025', price: 500, isApproved: true, moderationStatus: 'approved', tags: ['A/L', 'Physics']
    });

    console.log('Successfully seeded Sri Lankan localized platform ecosystem with master configuration!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
