// MongoDB Connection Status Checker
const mongoose = require('mongoose');

async function checkMongoDBStatus() {
  console.log('🔍 MongoDB Connection Status Check\n');
  console.log('=====================================\n');

  try {
    // Test 1: Check if MongoDB is running
    console.log('1️⃣ Testing MongoDB Service...');
    const conn = await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB is RUNNING on localhost:27017');
    await mongoose.disconnect();
    
    // Test 2: Check if database exists
    console.log('\n2️⃣ Testing Database Access...');
    await mongoose.connect('mongodb://localhost:27017/peerguru');
    console.log('✅ Database "peerguru" is accessible');
    
    // Test 3: Check collections
    console.log('\n3️⃣ Checking Collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Test 4: Check document counts
    console.log('\n4️⃣ Checking Document Counts...');
    const Question = require('./models/Question');
    const Answer = require('./models/Answer');
    
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();
    
    console.log(`📝 Questions: ${questionCount}`);
    console.log(`💬 Answers: ${answerCount}`);
    
    // Test 5: Test CRUD operations
    console.log('\n5️⃣ Testing CRUD Operations...');
    
    // Create test document
    const testQuestion = new Question({
      title: 'MongoDB Connection Test',
      body: 'This is a test document to verify MongoDB operations',
      subject: 'Mathematics',
      grade: 8,
      tags: ['test', 'mongodb'],
      author: '507f1f77bcf86cd799439011'
    });
    
    await testQuestion.save();
    console.log('✅ CREATE: Test document created');
    
    // Read test document
    const foundQuestion = await Question.findOne({ title: 'MongoDB Connection Test' });
    if (foundQuestion) {
      console.log('✅ READ: Test document found');
    }
    
    // Update test document
    foundQuestion.title = 'Updated MongoDB Connection Test';
    await foundQuestion.save();
    console.log('✅ UPDATE: Test document updated');
    
    // Delete test document
    await Question.deleteOne({ title: 'Updated MongoDB Connection Test' });
    console.log('✅ DELETE: Test document removed');
    
    console.log('\n🎉 MONGODB INTEGRATION STATUS: ✅ FULLY WORKING');
    console.log('=====================================');
    console.log('✅ Connection: Established');
    console.log('✅ Database: Accessible');
    console.log('✅ Collections: Available');
    console.log('✅ Models: Working');
    console.log('✅ CRUD: Functional');
    
  } catch (error) {
    console.error('\n❌ MONGODB CONNECTION FAILED');
    console.error('=====================================');
    console.error('Error:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n🔧 TROUBLESHOOTING STEPS:');
      console.error('1. Make sure MongoDB is installed');
      console.error('2. Check if MongoDB service is running:');
      console.error('   Windows: services.msc -> Look for "MongoDB"');
      console.error('   Or run: net start MongoDB');
      console.error('3. Verify MongoDB is listening on port 27017:');
      console.error('   Run: netstat -an | findstr 27017');
      console.error('4. Check MongoDB configuration:');
      console.error('   Default config: C:\\Program Files\\MongoDB\\Server\\X.X\\bin\\mongod.cfg');
      console.error('5. Try starting MongoDB manually:');
      console.error('   mongod --dbpath "C:\\data\\db"');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🔧 CONNECTION REFUSED:');
      console.error('- MongoDB is not running');
      console.error('- Port 27017 is blocked');
      console.error('- Firewall is blocking connection');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Additional helper functions
function showMongoDBCommands() {
  console.log('\n🛠️  USEFUL MONGODB COMMANDS:');
  console.log('=====================================');
  console.log('Start MongoDB:      net start MongoDB');
  console.log('Stop MongoDB:       net stop MongoDB');
  console.log('Check Status:      netstat -an | findstr 27017');
  console.log('Connect Shell:     mongo');
  console.log('List Databases:    show dbs');
  console.log('Use Database:      use peerguru');
  console.log('Show Collections:  show collections');
  console.log('Count Documents:   db.questions.count()');
}

// Run the check
checkMongoDBStatus();
showMongoDBCommands();
