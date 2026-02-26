const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/peerlearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedStudents = async () => {
  try {
    console.log('Seeding test student accounts...');
    
    const students = [
      {
        username: 'student1',
        email: 'student1@example.com',
        password: 'Student@123',
        role: 'student',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      {
        username: 'student2',
        email: 'student2@example.com',
        password: 'Student@123',
        role: 'student',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      },
      {
        username: 'student3',
        email: 'student3@example.com',
        password: 'Student@123',
        role: 'student',
        profile: {
          firstName: 'Mike',
          lastName: 'Johnson'
        }
      }
    ];
    
    for (const studentData of students) {
      const existingStudent = await User.findOne({ email: studentData.email });
      if (!existingStudent) {
        const student = new User(studentData);
        await student.save();
        console.log(`✓ Created student: ${studentData.email}`);
      } else {
        console.log(`✓ Student already exists: ${studentData.email}`);
      }
    }
    
    console.log('\nStudent seeding completed!');
    console.log('\nTest Credentials:');
    console.log('Email: student1@example.com');
    console.log('Password: Student@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedStudents();
