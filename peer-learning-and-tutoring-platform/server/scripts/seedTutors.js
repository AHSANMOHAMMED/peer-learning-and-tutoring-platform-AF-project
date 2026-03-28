const mongoose = require('mongoose');
const User = require('../models/User');
const Tutor = require('../models/Tutor');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/peerlearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedTutors = async () => {
  try {
    console.log('Starting tutor seeding process...');
    
    // Get all users with role='tutor'
    const tutorUsers = await User.find({ role: 'tutor' });
    console.log(`Found ${tutorUsers.length} tutor users`);
    
    for (const user of tutorUsers) {
      // Check if tutor profile already exists for this user
      const existingTutor = await Tutor.findOne({ userId: user._id });
      
      if (!existingTutor) {
        // Create new tutor profile
        const tutor = new Tutor({
          userId: user._id,
          subjects: [
            {
              name: 'Mathematics',
              gradeLevels: [9, 10, 11, 12],
              hourlyRate: 50,
              description: 'Master mathematics from basics to advanced topics'
            },
            {
              name: 'Science',
              gradeLevels: [8, 9, 10, 11],
              hourlyRate: 45,
              description: 'Comprehensive science education including Physics, Chemistry, Biology'
            }
          ],
          availability: [
            {
              dayOfWeek: 1, // Monday
              startTime: '09:00',
              endTime: '17:00',
              isRecurring: true
            },
            {
              dayOfWeek: 3, // Wednesday
              startTime: '09:00',
              endTime: '17:00',
              isRecurring: true
            },
            {
              dayOfWeek: 5, // Friday
              startTime: '09:00',
              endTime: '17:00',
              isRecurring: true
            }
          ],
          qualifications: {
            education: 'Bachelor of Science in Education',
            certifications: ['Teaching Certification', 'Subject Matter Expert'],
            experience: 'Over 5 years of teaching experience at school and university levels',
            documents: []
          },
          rating: {
            average: 4.5,
            count: 12,
            breakdown: {
              teaching: 4.6,
              knowledge: 4.5,
              communication: 4.4,
              punctuality: 4.5
            }
          },
          stats: {
            totalSessions: 156,
            totalStudents: 28,
            completionRate: 95,
            cancellationRate: 2
          }
        });
        
        await tutor.save();
        console.log(`✓ Created tutor profile for user: ${user.username} (${user.email})`);
      } else {
        console.log(`✓ Tutor profile already exists for user: ${user.username}`);
      }
    }
    
    console.log('Tutor seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Tutor seeding error:', error);
    process.exit(1);
  }
};

seedTutors();
