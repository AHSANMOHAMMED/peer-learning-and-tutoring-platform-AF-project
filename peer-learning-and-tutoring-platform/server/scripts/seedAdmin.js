require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peerlearn');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@peerlearn.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@peerlearn.com');
      console.log('Password: Admin@12345');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true,
      isActive: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1234567890'
      }
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@peerlearn.com');
    console.log('Password: Admin@12345');
    console.log('\nUse these credentials to login to the admin dashboard');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
