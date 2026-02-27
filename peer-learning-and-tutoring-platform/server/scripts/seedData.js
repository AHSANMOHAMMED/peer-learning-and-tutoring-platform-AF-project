const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Material = require('../models/Material');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/peerlearn';

// Helper functions
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  try {
    await User.deleteMany({});
    await Tutor.deleteMany({});
    await Material.deleteMany({});
    await Booking.deleteMany({});
    await Report.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
}

async function seedUsers() {
  console.log('👥 Creating users...');
  
  const usersData = [
    // Admin users
    {
      username: 'admin1',
      email: 'admin@peerlearn.com',
      password: 'Admin@123',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        bio: 'Platform administrator'
      }
    },
    // Moderators
    {
      username: 'moderator1',
      email: 'moderator1@peerlearn.com',
      password: 'Mod@123456',
      role: 'student', // Will be moderator role
      profile: {
        firstName: 'Maria',
        lastName: 'Garcia',
        grade: 12,
        school: 'Central High School',
        phone: '+1234567891',
        bio: 'Content moderator'
      }
    },
    {
      username: 'moderator2',
      email: 'moderator2@peerlearn.com',
      password: 'Mod@123456',
      role: 'student',
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        grade: 11,
        school: 'Tech Institute',
        phone: '+1234567892',
        bio: 'Safety moderator'
      }
    },
    // Tutors
    {
      username: 'tutor_math',
      email: 'tutor.math@peerlearn.com',
      password: 'Tutor@123456',
      role: 'tutor',
      profile: {
        firstName: 'Alex',
        lastName: 'Johnson',
        grade: 13,
        school: 'University of Science',
        phone: '+1234567893',
        bio: 'Passionate about teaching mathematics'
      }
    },
    {
      username: 'tutor_english',
      email: 'tutor.english@peerlearn.com',
      password: 'Tutor@123456',
      role: 'tutor',
      profile: {
        firstName: 'Sarah',
        lastName: 'Williams',
        grade: 13,
        school: 'Arts College',
        phone: '+1234567894',
        bio: 'English literature expert'
      }
    },
    {
      username: 'tutor_science',
      email: 'tutor.science@peerlearn.com',
      password: 'Tutor@123456',
      role: 'tutor',
      profile: {
        firstName: 'David',
        lastName: 'Brown',
        grade: 12,
        school: 'Science Academy',
        phone: '+1234567895',
        bio: 'Physics and Chemistry specialist'
      }
    },
    // Students
    {
      username: 'student1',
      email: 'student1@peerlearn.com',
      password: 'Student@123',
      role: 'student',
      profile: {
        firstName: 'Emma',
        lastName: 'Davis',
        grade: 10,
        school: 'Downtown High School',
        phone: '+1234567896',
        bio: 'Grade 10 student looking for tutoring'
      }
    },
    {
      username: 'student2',
      email: 'student2@peerlearn.com',
      password: 'Student@123',
      role: 'student',
      profile: {
        firstName: 'Michael',
        lastName: 'Wilson',
        grade: 9,
        school: 'Lincoln Academy',
        phone: '+1234567897',
        bio: 'Need help with math and science'
      }
    },
    {
      username: 'student3',
      email: 'student3@peerlearn.com',
      password: 'Student@123',
      role: 'student',
      profile: {
        firstName: 'Olivia',
        lastName: 'Martinez',
        grade: 11,
        school: 'Riverside School',
        phone: '+1234567898',
        bio: 'Interested in English literature'
      }
    },
    {
      username: 'student4',
      email: 'student4@peerlearn.com',
      password: 'Student@123',
      role: 'student',
      profile: {
        firstName: 'James',
        lastName: 'Anderson',
        grade: 8,
        school: 'Greenfield Middle School',
        phone: '+1234567899',
        bio: 'All-rounder student'
      }
    }
  ];

  const hashedUsers = await Promise.all(
    usersData.map(async (userData) => ({
      ...userData,
      password: await hashPassword(userData.password)
    }))
  );

  const users = await User.insertMany(hashedUsers);
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedTutors(users) {
  console.log('🎓 Creating tutor profiles...');
  
  const tutorUsers = users.filter(u => u.role === 'tutor');
  
  const tutorsData = [
    {
      userId: tutorUsers[0]._id, // Alex Johnson
      subjects: [
        {
          name: 'Mathematics',
          gradeLevels: [9, 10, 11, 12],
          hourlyRate: 25,
          description: 'Algebra, Geometry, Calculus, Statistics'
        },
        {
          name: 'Physics',
          gradeLevels: [10, 11, 12],
          hourlyRate: 28,
          description: 'Mechanics, Thermodynamics, Waves'
        }
      ],
      availability: [
        { dayOfWeek: 1, startTime: '15:00', endTime: '20:00', isRecurring: true },
        { dayOfWeek: 3, startTime: '15:00', endTime: '20:00', isRecurring: true },
        { dayOfWeek: 5, startTime: '14:00', endTime: '21:00', isRecurring: true },
        { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isRecurring: true }
      ],
      qualifications: {
        education: 'B.S. Mathematics, University of Science',
        certifications: ['IGCSE Mathematics', 'A-Level Mathematics'],
        experience: '5 years of tutoring experience with 100+ students'
      },
      rating: {
        average: 4.8,
        count: 45,
        breakdown: {
          teaching: 4.9,
          knowledge: 5,
          communication: 4.7,
          punctuality: 4.8
        }
      },
      stats: {
        totalSessions: 120,
        totalStudents: 25
      }
    },
    {
      userId: tutorUsers[1]._id, // Sarah Williams
      subjects: [
        {
          name: 'English',
          gradeLevels: [8, 9, 10, 11, 12],
          hourlyRate: 22,
          description: 'Literature, Writing, Grammar, Exam Prep'
        },
        {
          name: 'History',
          gradeLevels: [9, 10, 11],
          hourlyRate: 20,
          description: 'World History, Modern History'
        }
      ],
      availability: [
        { dayOfWeek: 0, startTime: '14:00', endTime: '19:00', isRecurring: true },
        { dayOfWeek: 2, startTime: '16:00', endTime: '20:00', isRecurring: true },
        { dayOfWeek: 4, startTime: '15:00', endTime: '19:00', isRecurring: true },
        { dayOfWeek: 6, startTime: '11:00', endTime: '17:00', isRecurring: true }
      ],
      qualifications: {
        education: 'B.A. English Literature, Arts College',
        certifications: ['IGCSE English', 'A-Level English Literature'],
        experience: '4 years teaching English in secondary schools'
      },
      rating: {
        average: 4.7,
        count: 38,
        breakdown: {
          teaching: 4.8,
          knowledge: 4.6,
          communication: 4.9,
          punctuality: 4.5
        }
      },
      stats: {
        totalSessions: 95,
        totalStudents: 20
      }
    },
    {
      userId: tutorUsers[2]._id, // David Brown
      subjects: [
        {
          name: 'Chemistry',
          gradeLevels: [10, 11, 12],
          hourlyRate: 26,
          description: 'Organic, Inorganic, Physical Chemistry'
        },
        {
          name: 'Biology',
          gradeLevels: [9, 10, 11, 12],
          hourlyRate: 24,
          description: 'General Biology, Anatomy, Genetics'
        }
      ],
      availability: [
        { dayOfWeek: 1, startTime: '16:00', endTime: '21:00', isRecurring: true },
        { dayOfWeek: 3, startTime: '16:00', endTime: '21:00', isRecurring: true },
        { dayOfWeek: 5, startTime: '14:00', endTime: '20:00', isRecurring: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '16:00', isRecurring: true }
      ],
      qualifications: {
        education: 'B.S. Chemistry, Science Academy',
        certifications: ['IGCSE Science', 'A-Level Chemistry & Biology'],
        experience: '3 years in science education'
      },
      rating: {
        average: 4.6,
        count: 32,
        breakdown: {
          teaching: 4.7,
          knowledge: 4.8,
          communication: 4.4,
          punctuality: 4.6
        }
      },
      stats: {
        totalSessions: 78,
        totalStudents: 18
      }
    }
  ];

  const tutors = await Tutor.insertMany(tutorsData);
  console.log(`✅ Created ${tutors.length} tutor profiles`);
  return tutors;
}

async function seedMaterials(users) {
  console.log('📚 Creating materials...');
  
  const studentUsers = users.filter(u => u.role === 'student');
  const tutorUsers = users.filter(u => u.role === 'tutor');
  
  const materialsData = [
    // Approved materials
    {
      title: 'Advanced Calculus Notes - Chapter 5',
      description: 'Comprehensive notes covering derivatives, integrals, and applications. Includes solved examples and practice problems.',
      type: 'pdf',
      fileUrl: 'https://example.com/files/calculus-ch5.pdf',
      fileName: 'calculus-ch5.pdf',
      originalFileName: 'Advanced_Calculus_Notes_Chapter5.pdf',
      fileSize: 2500000,
      mimeType: 'application/pdf',
      uploadedBy: tutorUsers[0]._id,
      subject: 'Mathematics',
      grade: 11,
      tags: ['calculus', 'derivatives', 'integrals'],
      status: 'approved',
      approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      approvedBy: studentUsers[0]._id
    },
    {
      title: 'Shakespeare\'s "Hamlet" - Study Guide',
      description: 'Complete study guide with character analysis, themes, and key quotes from Hamlet. Perfect for exam preparation.',
      type: 'document',
      fileUrl: 'https://example.com/files/hamlet-guide.docx',
      fileName: 'hamlet-guide.docx',
      originalFileName: 'Hamlet_Study_Guide.docx',
      fileSize: 1800000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedBy: tutorUsers[1]._id,
      subject: 'English',
      grade: 12,
      tags: ['shakespeare', 'literature', 'exam-prep'],
      status: 'approved',
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvedBy: studentUsers[1]._id
    },
    {
      title: 'Periodic Table Quiz - Interactive',
      description: 'Interactive quiz to test knowledge of the periodic table elements, atomic numbers, and properties.',
      type: 'presentation',
      fileUrl: 'https://example.com/files/periodic-table-quiz.pptx',
      fileName: 'periodic-table-quiz.pptx',
      originalFileName: 'Periodic_Table_Quiz.pptx',
      fileSize: 5200000,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      uploadedBy: tutorUsers[2]._id,
      subject: 'Chemistry',
      grade: 10,
      tags: ['chemistry', 'periodic table', 'quiz'],
      status: 'approved',
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedBy: studentUsers[2]._id
    },
    // Pending materials
    {
      title: 'Vector Mathematics - Complete Tutorial',
      description: 'Detailed tutorial on vectors, dot products, cross products, and applications in physics.',
      type: 'pdf',
      fileUrl: 'https://example.com/files/vectors-tutorial.pdf',
      fileName: 'vectors-tutorial.pdf',
      originalFileName: 'Vector_Mathematics_Tutorial.pdf',
      fileSize: 3100000,
      mimeType: 'application/pdf',
      uploadedBy: tutorUsers[0]._id,
      subject: 'Mathematics',
      grade: 12,
      tags: ['vectors', 'physics', 'tutorial'],
      status: 'pending',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      title: 'French Vocabulary Builder - 5000 Words',
      description: 'Comprehensive vocabulary list with audio pronunciation and usage examples for GCSE French.',
      type: 'document',
      fileUrl: 'https://example.com/files/french-vocab.xlsx',
      fileName: 'french-vocab.xlsx',
      originalFileName: 'French_Vocabulary_5000.xlsx',
      fileSize: 1200000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedBy: studentUsers[0]._id,
      subject: 'Languages',
      grade: 9,
      tags: ['french', 'vocabulary', 'languages'],
      status: 'pending',
      uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      title: 'Photosynthesis Animation & Notes',
      description: 'Step-by-step animation explaining photosynthesis with detailed biological notes.',
      type: 'video',
      fileUrl: 'https://example.com/files/photosynthesis.mp4',
      fileName: 'photosynthesis.mp4',
      originalFileName: 'Photosynthesis_Animation.mp4',
      fileSize: 85000000,
      mimeType: 'video/mp4',
      uploadedBy: tutorUsers[2]._id,
      subject: 'Biology',
      grade: 10,
      tags: ['biology', 'photosynthesis', 'video'],
      status: 'pending',
      uploadedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    // Rejected materials
    {
      title: 'Outdated Physics Formulas - 1990 Edition',
      description: 'Old reference book with outdated formulas and theories.',
      type: 'pdf',
      fileUrl: 'https://example.com/files/old-physics.pdf',
      fileName: 'old-physics.pdf',
      originalFileName: 'Old_Physics_1990.pdf',
      fileSize: 4000000,
      mimeType: 'application/pdf',
      uploadedBy: studentUsers[1]._id,
      subject: 'Physics',
      grade: 11,
      tags: ['physics', 'outdated'],
      status: 'rejected',
      rejectionReason: 'Content is outdated and contains inaccurate information',
      rejectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      rejectedBy: studentUsers[2]._id
    }
  ];

  const materials = await Material.insertMany(materialsData);
  console.log(`✅ Created ${materials.length} materials (various statuses)`);
  return materials;
}

async function seedBookings(users, tutors) {
  console.log('📅 Creating session bookings...');
  
  const studentUsers = users.filter(u => u.role === 'student');
  const tutorIds = tutors.map(t => t._id);
  
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const bookingsData = [
    // Confirmed upcoming sessions
    {
      studentId: studentUsers[0]._id,
      tutorId: tutorIds[0],
      subject: 'Mathematics',
      grade: 10,
      date: nextWeek,
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      status: 'confirmed',
      payment: {
        amount: 25,
        currency: 'USD',
        status: 'paid',
        paidAt: new Date()
      }
    },
    {
      studentId: studentUsers[1]._id,
      tutorId: tutorIds[1],
      subject: 'English',
      grade: 9,
      date: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      status: 'confirmed',
      payment: {
        amount: 33,
        currency: 'USD',
        status: 'paid',
        paidAt: new Date()
      }
    },
    // Pending session requests
    {
      studentId: studentUsers[2]._id,
      tutorId: tutorIds[0],
      subject: 'Physics',
      grade: 11,
      date: tomorrow,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      status: 'pending',
      payment: {
        amount: 28,
        currency: 'USD',
        status: 'pending'
      }
    },
    {
      studentId: studentUsers[3]._id,
      tutorId: tutorIds[2],
      subject: 'Chemistry',
      grade: 8,
      date: new Date(tomorrow.getTime() + 1 * 24 * 60 * 60 * 1000),
      startTime: '17:00',
      endTime: '18:00',
      duration: 60,
      status: 'pending',
      payment: {
        amount: 26,
        currency: 'USD',
        status: 'pending'
      }
    },
    // Completed sessions
    {
      studentId: studentUsers[0]._id,
      tutorId: tutorIds[1],
      subject: 'English',
      grade: 10,
      date: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      status: 'completed',
      payment: {
        amount: 22,
        currency: 'USD',
        status: 'paid',
        paidAt: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      feedback: {
        rating: 5,
        comment: 'Amazing session! Very helpful with my essay writing.'
      }
    },
    {
      studentId: studentUsers[1]._id,
      tutorId: tutorIds[0],
      subject: 'Mathematics',
      grade: 9,
      date: new Date(lastWeek.getTime() - 3 * 24 * 60 * 60 * 1000),
      startTime: '16:00',
      endTime: '17:00',
      duration: 60,
      status: 'completed',
      payment: {
        amount: 25,
        currency: 'USD',
        status: 'paid',
        paidAt: new Date(lastWeek.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      feedback: {
        rating: 4,
        comment: 'Good explanation of calculus concepts'
      }
    },
    // In-progress session
    {
      studentId: studentUsers[2]._id,
      tutorId: tutorIds[2],
      subject: 'Biology',
      grade: 11,
      date: today,
      startTime: '18:00',
      endTime: '19:00',
      duration: 60,
      status: 'in_progress',
      payment: {
        amount: 24,
        currency: 'USD',
        status: 'paid',
        paidAt: new Date()
      }
    }
  ];

  const bookings = await Booking.insertMany(bookingsData);
  console.log(`✅ Created ${bookings.length} session bookings`);
  return bookings;
}

async function seedReports(users, materials) {
  console.log('🚨 Creating moderation reports...');
  
  const studentUsers = users.filter(u => u.role === 'student');
  const moderatorUsers = studentUsers.slice(0, 2);
  
  const reportsData = [
    // Pending reports
    {
      reporterId: studentUsers[1]._id,
      reportedType: 'material',
      reportedId: materials[1]._id,
      reason: 'copyright',
      description: 'This content appears to be copied from a published textbook without attribution.',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      reporterId: studentUsers[0]._id,
      reportedType: 'material',
      reportedId: materials[4]._id,
      reason: 'inappropriate',
      description: 'Contains language not suitable for students',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    // Under review
    {
      reporterId: studentUsers[2]._id,
      reportedType: 'user',
      reportedId: studentUsers[3]._id,
      reason: 'harassment',
      description: 'User has been sending inappropriate messages',
      status: 'under_review',
      priority: 'urgent',
      assignedTo: moderatorUsers[0]._id,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      evidence: ['https://example.com/screenshot1.png', 'https://example.com/screenshot2.png']
    },
    // Resolved reports
    {
      reporterId: studentUsers[0]._id,
      reportedType: 'material',
      reportedId: materials[6]._id,
      reason: 'spam',
      description: 'Duplicate content posted multiple times',
      status: 'resolved',
      priority: 'low',
      assignedTo: moderatorUsers[1]._id,
      resolution: {
        action: 'content_removed',
        actionTakenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Removed spam content as requested'
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const reports = await Report.insertMany(reportsData);
  console.log(`✅ Created ${reports.length} moderation reports`);
  return reports;
}

async function seedReviews(users, bookings) {
  console.log('⭐ Creating reviews...');
  
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const tutors = await Tutor.find();
  
  const reviewsData = completedBookings.map((booking, index) => {
    const tutor = tutors.find(t => t._id.toString() === booking.tutorId.toString());
    return {
      bookingId: booking._id,
      reviewerId: booking.studentId,
      tutorId: tutor ? tutor._id : tutors[0]._id,
      rating: {
        overall: [5, 4, 4.5][index] || 4,
        teaching: [5, 4, 5][index] || 4,
        knowledge: [5, 5, 4][index] || 4,
        communication: [4, 4, 5][index] || 4,
        punctuality: [5, 3, 5][index] || 4
      },
      comment: [
        'Excellent tutoring session! Alex really knows mathematics well and explained complex concepts clearly.',
        'Sarah was very helpful with my English essay. Her feedback was constructive and practical.',
        'Great chemistry lesson! David made difficult concepts understandable.'
      ][index] || 'Great tutor!',
      isVisible: true,
      verifiedPurchase: true,
      createdAt: new Date(Date.now() - (5 - index) * 24 * 60 * 60 * 1000)
    };
  });

  const reviews = await Review.insertMany(reviewsData);
  console.log(`✅ Created ${reviews.length} reviews`);
  return reviews;
}

async function runSeedScript() {
  try {
    console.log('🌱 Starting seed data import...\n');
    
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    await seedTutors(users);
    const materials = await seedMaterials(users);
    const tutors = await Tutor.find();
    const bookings = await seedBookings(users, tutors);
    await seedReports(users, materials);
    await seedReviews(users, bookings);
    
    console.log('\n✨ Seed data imported successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${await Tutor.countDocuments()} tutors created`);
    console.log(`   - ${materials.length} materials created`);
    console.log(`   - ${bookings.length} session bookings created`);
    console.log(`   - ${await Report.countDocuments()} reports created`);
    console.log(`   - ${await Review.countDocuments()} reviews created\n`);
    
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@peerlearn.com / Admin@123');
    console.log('   Tutor: tutor.math@peerlearn.com / Tutor@123456');
    console.log('   Student: student1@peerlearn.com / Student@123');
    console.log('   Moderator: moderator1@peerlearn.com / Mod@123456\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed data import:', error);
    process.exit(1);
  }
}

// Run the seed script
runSeedScript();
