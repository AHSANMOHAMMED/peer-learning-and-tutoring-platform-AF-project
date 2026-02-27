// MongoDB Connection Test Script
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  try {
    // Test connection
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/peerguru', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database: peerguru');
    console.log('🌐 Host: localhost:27017\n');

    // Test creating a document
    console.log('🧪 Testing Document Creation...');
    const testSchema = new mongoose.Schema({
      title: String,
      createdAt: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('Test', testSchema);

    const testDoc = new TestModel({ title: 'MongoDB Connection Test' });
    await testDoc.save();
    console.log('✅ Document created successfully!');

    // Test reading documents
    const docs = await TestModel.find();
    console.log(`📋 Found ${docs.length} documents in test collection`);

    // Clean up
    await TestModel.deleteMany({});
    console.log('🧹 Test data cleaned up\n');

    // Test Question model
    console.log('📚 Testing Question Model...');
    const Question = require('./models/Question');
    const questionCount = await Question.countDocuments();
    console.log(`📊 Questions in database: ${questionCount}`);

    // Test Answer model
    console.log('💬 Testing Answer Model...');
    const Answer = require('./models/Answer');
    const answerCount = await Answer.countDocuments();
    console.log(`📊 Answers in database: ${answerCount}`);

    console.log('\n🎉 MongoDB Integration is WORKING!');
    console.log('✅ Connection established');
    console.log('✅ Models accessible');
    console.log('✅ CRUD operations functional');

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure MongoDB is installed');
      console.log('2. Check if MongoDB service is running');
      console.log('3. Verify connection string: mongodb://localhost:27017/peerguru');
      console.log('4. Check if port 27017 is available');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testMongoDBConnection();
