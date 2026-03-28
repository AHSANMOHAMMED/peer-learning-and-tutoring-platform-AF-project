/**
 * Database Migration Script
 * Creates database indexes and initial data
 */

const mongoose = require('mongoose');
require('dotenv').config();

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peer_learning');
    console.log('✅ Connected to MongoDB');

    // Run index creation script
    const { createAllIndexes } = require('./db-indexes');
    await createAllIndexes();
    console.log('✅ Database indexes created');

    // Create initial admin user if not exists
    const User = require('../models/User');
    const adminExists = await User.findOne({ email: 'admin@peerlearn.com' });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@peerlearn.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          grade: 12,
          subjects: [],
          bio: 'System administrator account'
        },
        isEmailVerified: true
      });
      console.log('✅ Admin user created');
    }

    // Create sample data for development
    if (process.env.NODE_ENV === 'development') {
      await createSampleData();
    }

    console.log('🎉 Database migrations completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  console.log('📝 Creating sample development data...');
  
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  
  // Sample tutor
  const tutorExists = await User.findOne({ email: 'tutor@example.com' });
  if (!tutorExists) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    await User.create({
      username: 'john_tutor',
      name: 'John Tutor',
      email: 'tutor@example.com',
      password: hashedPassword,
      role: 'tutor',
      profile: {
        firstName: 'John',
        lastName: 'Tutor',
        grade: 10,
        subjects: ['Mathematics', 'Physics'],
        bio: 'Experienced tutor in Math and Physics',
        hourlyRate: 25,
        rating: 4.8,
        totalSessions: 50
      },
      isEmailVerified: true
    });
  }

  // Sample student
  const studentExists = await User.findOne({ email: 'student@example.com' });
  if (!studentExists) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    await User.create({
      username: 'jane_student',
      name: 'Jane Student',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'student',
      profile: {
        firstName: 'Jane',
        lastName: 'Student',
        grade: 10,
        subjects: ['Mathematics', 'Physics'],
        bio: 'High school student looking for help',
        learningStyle: 'visual'
      },
      isEmailVerified: true
    });
  }

  console.log('✅ Sample data created');
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
