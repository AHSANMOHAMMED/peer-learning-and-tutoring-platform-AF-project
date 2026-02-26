const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const BadgeInitializationService = require('../services/badgeInitializationService');
const Badge = require('../models/Badge');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const PointsService = require('../services/pointsService');

// Initialize the complete system
async function initializeSystem() {
  try {
    console.log('🚀 Initializing Q&A Platform System...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peer-learning-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Initialize required badges
    console.log('\n🏆 Initializing badges...');
    const createdBadges = await BadgeInitializationService.initializeRequiredBadges();
    console.log(`✅ Created ${createdBadges.length} badges`);
    
    // Display all badges
    const allBadges = await Badge.find().sort({ tier: 1, name: 1 });
    console.log('\n📋 All Available Badges:');
    allBadges.forEach((badge, index) => {
      console.log(`${index + 1}. ${badge.icon} ${badge.name} (${badge.rarity})`);
      console.log(`   ${badge.description}`);
      console.log(`   Criteria: ${badge.criteria.type} - ${badge.criteria.value} ${badge.criteria.subject !== 'all' ? `in ${badge.criteria.subject}` : 'global'}`);
      console.log(`   Points: ${badge.pointsAwarded}`);
      console.log('');
    });
    
    // Display point system
    console.log('💰 Point System:');
    console.log(`• Post question: +${PointsService.POINTS.QUESTION_POSTED} points`);
    console.log(`• Answer upvote received: +${PointsService.POINTS.ANSWER_UPVOTE_RECEIVED} points`);
    console.log(`• Answer downvote received: ${PointsService.POINTS.ANSWER_DOWNVOTE_RECEIVED} points`);
    console.log(`• Question upvote received: +${PointsService.POINTS.QUESTION_UPVOTE_RECEIVED} points`);
    
    // Display API endpoints
    console.log('\n🛣️  API Endpoints:');
    console.log('\nQuestions:');
    console.log('• POST   /api/questions           → create question (+2 points)');
    console.log('• GET    /api/questions           → list (newest first, ?subject=xxx & ?tag=xxx optional)');
    console.log('• GET    /api/questions/:id       → single question + its answers');
    console.log('• DELETE /api/questions/:id       → only own question');
    
    console.log('\nAnswers:');
    console.log('• POST   /api/questions/:qid/answers     → create answer');
    console.log('• GET    /api/questions/:qid/answers     → get answers (sorted by votes desc, then newest)');
    
    console.log('\nVoting:');
    console.log('• POST   /api/vote');
    console.log('  Body: { targetType: "Question"|"Answer", targetId, voteType: "up"|"down" }');
    
    console.log('\nLeaderboard:');
    console.log('• GET /api/leaderboard/global?limit=20&period=week|month|all');
    console.log('• GET /api/leaderboard/subject/:subject?limit=10');
    
    console.log('\n✅ System initialization complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your server with: npm start');
    console.log('2. Test the API endpoints');
    console.log('3. Create some test users and questions');
    console.log('4. Award badges by checking user eligibility');
    
  } catch (error) {
    console.error('❌ Error initializing system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run initialization
if (require.main === module) {
  initializeSystem();
}

module.exports = initializeSystem;
