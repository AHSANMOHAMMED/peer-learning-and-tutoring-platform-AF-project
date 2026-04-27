const mongoose = require('./config/db');
const User = require('./models/User');
const UserGamification = require('./models/UserGamification');

async function initializeGamification() {
  try {
    await mongoose;
    console.log('MongoDB Connected');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    let created = 0;
    let existing = 0;
    
    for (const user of users) {
      // Check if gamification profile exists
      let profile = await UserGamification.findOne({ user: user._id });
      
      if (!profile) {
        // Create gamification profile
        profile = await UserGamification.create({
          user: user._id,
          points: { total: 100, earnedThisMonth: 50, earnedThisWeek: 20, lifetime: 100 },
          level: { current: 2, title: 'Learner', progress: 10, pointsToNextLevel: 1500 },
          badges: [],
          streaks: { current: 3, longest: 5, lastActivity: new Date(), streakType: 'daily' },
          stats: {
            totalSessions: 5,
            peerSessions: 2,
            groupSessions: 1,
            lectureSessions: 2,
            totalHours: 10,
            coursesCompleted: 1,
            coursesInProgress: 2,
            studentsHelped: 0,
            hoursTutored: 0,
            averageRating: 0,
            totalReviews: 0
          }
        });
        created++;
        console.log(`Created gamification profile for: ${user.email}`);
      } else {
        existing++;
        console.log(`Gamification profile already exists for: ${user.email}`);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Created: ${created}`);
    console.log(`Already existed: ${existing}`);
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

initializeGamification();
