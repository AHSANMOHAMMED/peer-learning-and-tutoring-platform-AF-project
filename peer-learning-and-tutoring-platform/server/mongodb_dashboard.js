// MongoDB Dashboard - Quick Status Check
const mongoose = require('mongoose');

async function showDashboard() {
  console.clear();
  console.log('🗄️  PEERGURU MONGODB DASHBOARD');
  console.log('================================');
  console.log('');

  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/peerguru');
    
    // Get database info
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    // Get collections
    const collections = await db.listCollections().toArray();
    
    // Get document counts
    const Question = require('./models/Question');
    const Answer = require('./models/Answer');
    
    const questionCount = await Question.countDocuments();
    const answerCount = await Answer.countDocuments();
    
    // Display status
    console.log('📊 CONNECTION STATUS: ✅ CONNECTED');
    console.log(`🗄️  DATABASE: ${db.databaseName}`);
    console.log(`📁 COLLECTIONS: ${collections.length}`);
    console.log(`📝 QUESTIONS: ${questionCount}`);
    console.log(`💬 ANSWERS: ${answerCount}`);
    console.log(`💾 DATABASE SIZE: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
    
    // Show recent activity
    console.log('📋 COLLECTIONS:');
    collections.forEach(col => {
      console.log(`   📁 ${col.name}`);
    });
    
    console.log('');
    console.log('🎯 MONGODB INTEGRATION: ✅ FULLY OPERATIONAL');
    console.log('================================');
    
    // Test API endpoints
    console.log('\n🌐 TESTING API ENDPOINTS:');
    console.log('=============================');
    
    const axios = require('axios');
    
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health Check:', healthResponse.data.success ? 'Working' : 'Failed');
    } catch (error) {
      console.log('❌ Health Check: Server not running');
    }
    
    try {
      const statsResponse = await axios.get('http://localhost:5000/api/mongodb/stats');
      if (statsResponse.data.mongodb === 'Connected') {
        console.log('✅ MongoDB API: Working');
        console.log(`📊 API Questions: ${statsResponse.data.questions}`);
        console.log(`💬 API Answers: ${statsResponse.data.answers}`);
      }
    } catch (error) {
      console.log('❌ MongoDB API: Server not responding');
    }
    
  } catch (error) {
    console.log('❌ CONNECTION STATUS: FAILED');
    console.log(`Error: ${error.message}`);
    
    console.log('\n🔧 QUICK FIXES:');
    console.log('1. Start MongoDB: net start MongoDB');
    console.log('2. Check port: netstat -an | findstr 27017');
    console.log('3. Restart service: services.msc');
  }
  
  await mongoose.disconnect();
}

// Show dashboard
showDashboard();
