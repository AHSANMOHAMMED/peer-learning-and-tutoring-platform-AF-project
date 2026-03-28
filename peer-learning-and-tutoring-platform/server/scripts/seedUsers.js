require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const connectDB = require('../config/db');

// Test user data
const testUsers = [
  {
    username: 'student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    profile: {
      firstName: 'Test',
      lastName: 'Student',
      grade: 10,
      school: 'Test High School',
      bio: 'I am a test student looking to learn new subjects.'
    },
    isActive: true,
    emailVerified: true
  },
  {
    username: 'tutor',
    email: 'tutor@test.com',
    password: 'password123',
    role: 'tutor',
    profile: {
      firstName: 'Test',
      lastName: 'Tutor',
      bio: 'Experienced tutor in Mathematics and Physics.'
    },
    isActive: true,
    emailVerified: true
  },
  {
    username: 'admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Platform administrator.'
    },
    isActive: true,
    emailVerified: true
  },
  {
    username: 'parent',
    email: 'parent@test.com',
    password: 'password123',
    role: 'parent',
    profile: {
      firstName: 'Test',
      lastName: 'Parent',
      bio: 'Parent monitoring student progress.'
    },
    isActive: true,
    emailVerified: true
  }
];

// Tutor profile data - matching the actual Tutor schema
const tutorProfile = {
  subjects: [
    { 
      name: 'Mathematics', 
      gradeLevels: [9, 10, 11, 12], 
      hourlyRate: 25,
      description: 'Expert in algebra, calculus, and geometry'
    },
    { 
      name: 'Physics', 
      gradeLevels: [11, 12], 
      hourlyRate: 30,
      description: 'Specialized in mechanics and electromagnetism'
    }
  ],
  availability: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isRecurring: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isRecurring: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isRecurring: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isRecurring: true },
    { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isRecurring: true }
  ],
  qualifications: {
    education: 'B.Sc. in Physics, M.Sc. in Mathematics',
    certifications: ['Teaching Certificate', 'Advanced Calculus Certification'],
    experience: '3 years of tutoring experience with high school and college students.'
  },
  rating: {
    average: 4.8,
    count: 12
  },
  totalSessions: 45,
  totalStudents: 15,
  isVerified: true,
  bio: 'Passionate about teaching and helping students understand complex concepts.'
};

async function seedUsers() {
  try {
    // Connect to database
    await connectDB();
    console.log('📦 Connected to database');

    // Clear existing test users
    console.log('🧹 Clearing existing test users...');
    await User.deleteMany({ 
      email: { $in: testUsers.map(u => u.email) } 
    });
    
    // Clear existing tutor profile for test tutor
    const existingTutor = await User.findOne({ email: 'tutor@test.com' });
    if (existingTutor) {
      await Tutor.deleteOne({ user: existingTutor._id });
    }
    await Tutor.deleteMany({ email: 'tutor@test.com' });

    // Create users
    console.log('🌱 Creating test users...');
    const createdUsers = [];
    
    for (const userData of testUsers) {
      // Create user - password will be hashed by the pre-save hook
      const user = new User(userData);
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
      
      // Create tutor profile if user is tutor
      if (userData.role === 'tutor') {
        const tutor = new Tutor({
          userId: user._id,
          ...tutorProfile
        });
        await tutor.save();
        console.log(`✅ Created tutor profile for ${userData.email}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('---------------------------');
    testUsers.forEach(u => {
      console.log(`${u.role.toUpperCase()}:`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeder
seedUsers();
