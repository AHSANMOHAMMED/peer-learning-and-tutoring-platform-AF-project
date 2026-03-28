/**
 * Database Indexes Configuration
 * Performance optimization indexes for MongoDB collections
 * Run this script to create all necessary indexes
 */

const mongoose = require('mongoose');

// Index definitions for all models
const indexDefinitions = {
  // User collection indexes
  users: [
    { fields: { email: 1 }, options: { unique: true } },
    { fields: { role: 1, isActive: 1 } },
    { fields: { 'profile.subjects': 1 } },
    { fields: { 'profile.grade': 1 } },
    { fields: { reputation: -1 } },
    { fields: { createdAt: -1 } },
    { fields: { lastLoginAt: -1 } }
  ],

  // PeerSession collection indexes
  peersessions: [
    { fields: { initiator: 1, status: 1 } },
    { fields: { matchedPeer: 1, status: 1 } },
    { fields: { subject: 1, grade: 1 } },
    { fields: { scheduledAt: 1 } },
    { fields: { status: 1, scheduledAt: 1 } },
    { fields: { participants: 1 } }
  ],

  // GroupRoom collection indexes
  grouprooms: [
    { fields: { host: 1, isActive: 1 } },
    { fields: { subject: 1, isActive: 1 } },
    { fields: { 'participants.user': 1 } },
    { fields: { createdAt: -1 } },
    { fields: { isActive: 1, participants: 1 } }
  ],

  // LectureCourse collection indexes
  lecturecourses: [
    { fields: { instructor: 1, status: 1 } },
    { fields: { subject: 1, targetGrade: 1, isPublished: 1 } },
    { fields: { isPublished: 1, rating: -1 } },
    { fields: { enrolledStudents: 1 } },
    { fields: { 'sessions.scheduledAt': 1 } },
    { fields: { subject: 'text', title: 'text', description: 'text' } }
  ],

  // LectureSession collection indexes
  lecturesessions: [
    { fields: { courseId: 1 } },
    { fields: { participants: 1 } },
    { fields: { startedAt: -1 } },
    { fields: { courseId: 1, startedAt: -1 } }
  ],

  // Session/Booking collection indexes
  sessions: [
    { fields: { tutor: 1, status: 1 } },
    { fields: { student: 1, status: 1 } },
    { fields: { scheduledAt: 1, status: 1 } },
    { fields: { subject: 1, status: 1 } },
    { fields: { roomId: 1 }, options: { unique: true, sparse: true } }
  ],

  // Message collection indexes
  messages: [
    { fields: { sessionId: 1, createdAt: -1 } },
    { fields: { sender: 1, createdAt: -1 } },
    { fields: { sessionId: 1, sender: 1 } },
    { fields: { createdAt: -1 }, options: { expireAfterSeconds: 2592000 } } // TTL: 30 days
  ],

  // Notification collection indexes
  notifications: [
    { fields: { userId: 1, isRead: 1 } },
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { type: 1, createdAt: -1 } },
    { fields: { createdAt: -1 }, options: { expireAfterSeconds: 604800 } } // TTL: 7 days
  ],

  // Gamification/Points collection indexes
  points: [
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { userId: 1, category: 1 } },
    { fields: { sessionId: 1 } }
  ],

  // Leaderboard collection indexes
  leaderboard: [
    { fields: { category: 1, period: 1, rank: 1 } },
    { fields: { userId: 1, category: 1 } },
    { fields: { updatedAt: -1 } }
  ],

  // HomeworkSession collection indexes
  homeworksessions: [
    { fields: { user: 1, createdAt: -1 } },
    { fields: { subject: 1, createdAt: -1 } },
    { fields: { 'aiAnalysis.completed': 1 } }
  ],

  // CourseMaterial collection indexes
  coursematerials: [
    { fields: { courseId: 1, type: 1 } },
    { fields: { uploadedBy: 1 } },
    { fields: { subject: 1, grade: 1 } },
    { fields: { title: 'text', description: 'text' } }
  ],

  // Recording collection indexes
  recordings: [
    { fields: { sessionId: 1 } },
    { fields: { courseId: 1, createdAt: -1 } },
    { fields: { instructor: 1 } }
  ],

  // Analytics/Engagement collection indexes
  analytics: [
    { fields: { sessionId: 1, userId: 1 } },
    { fields: { sessionId: 1, timestamp: -1 } },
    { fields: { userId: 1, timestamp: -1 } },
    { fields: { timestamp: -1 }, options: { expireAfterSeconds: 7776000 } } // TTL: 90 days
  ]
};

/**
 * Create all indexes for a collection
 * @param {string} collectionName - Name of the collection
 * @param {Array} indexes - Array of index definitions
 */
async function createIndexesForCollection(collectionName, indexes) {
  try {
    const collection = mongoose.connection.collection(collectionName);
    
    for (const indexDef of indexes) {
      await collection.createIndex(indexDef.fields, indexDef.options || {});
      console.log(`✓ Created index on ${collectionName}: ${JSON.stringify(indexDef.fields)}`);
    }
    
    console.log(`✅ Completed indexes for ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error creating indexes for ${collectionName}:`, error.message);
  }
}

/**
 * Create all database indexes
 */
async function createAllIndexes() {
  console.log('🚀 Starting database index creation...\n');
  
  for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
    await createIndexesForCollection(collectionName, indexes);
  }
  
  console.log('\n✅ All indexes created successfully!');
}

/**
 * Drop all indexes (useful for rebuilding)
 */
async function dropAllIndexes() {
  console.log('🗑️ Dropping all indexes...\n');
  
  for (const collectionName of Object.keys(indexDefinitions)) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      await collection.dropIndexes();
      console.log(`✓ Dropped indexes from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error dropping indexes from ${collectionName}:`, error.message);
    }
  }
  
  console.log('\n✅ All indexes dropped!');
}

/**
 * List all indexes for verification
 */
async function listAllIndexes() {
  console.log('📋 Listing all indexes...\n');
  
  for (const collectionName of Object.keys(indexDefinitions)) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const indexes = await collection.indexes();
      
      console.log(`\n${collectionName}:`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.error(`❌ Error listing indexes for ${collectionName}:`, error.message);
    }
  }
}

// Export functions for use in other modules
module.exports = {
  createAllIndexes,
  dropAllIndexes,
  listAllIndexes,
  indexDefinitions
};

// Run if called directly
if (require.main === module) {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peer_learning';
  
  mongoose.connect(mongoUri)
    .then(async () => {
      console.log('Connected to MongoDB\n');
      
      const command = process.argv[2];
      
      switch (command) {
        case 'create':
          await createAllIndexes();
          break;
        case 'drop':
          await dropAllIndexes();
          break;
        case 'list':
          await listAllIndexes();
          break;
        default:
          console.log('Usage: node db-indexes.js [create|drop|list]');
      }
      
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    });
}
