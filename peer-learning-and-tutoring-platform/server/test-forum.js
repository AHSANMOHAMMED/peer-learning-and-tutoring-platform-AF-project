// Test script for Q&A Forum and Gamification System
// Run with: node test-forum.js

const axios = require('axios');
const mongoose = require('mongoose');

const API_BASE = 'http://localhost:5000/api';

// Test data
let testUser = null;
let testQuestion = null;
let testAnswer = null;
let authToken = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

async function testUserAuth() {
  console.log('\n🧪 Testing User Authentication...');
  console.log('\n🔐 Testing User Authentication...');
  
  // Register test user
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123',
    profile: {
      firstName: 'Test',
      lastName: 'User'
    }
  };

  const registerResult = await makeRequest('POST', '/auth/register', registerData);
  if (!registerResult.success) {
    console.log('❌ Registration failed:', registerResult.error);
    return false;
  }
  console.log('✅ User registered successfully');

  // Login test user
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };

  const loginResult = await makeRequest('POST', '/auth/login', loginData);
  if (!loginResult.success) {
    console.log('❌ Login failed:', loginResult.error);
    return false;
  }

  authToken = loginResult.data.token;
  testUser = loginResult.data.user;
  console.log('✅ User logged in successfully');
  return true;
}

async function testQuestions() {
  console.log('\n❓ Testing Questions...');
  
  // Create a question
  const questionData = {
    title: 'What is the Pythagorean theorem and how is it used?',
    body: 'I need help understanding the Pythagorean theorem. Can someone explain it with examples?',
    category: 'Mathematics',
    tags: ['math', 'geometry', 'pythagorean']
  };

  const createResult = await makeRequest('POST', '/questions', questionData, true);
  if (!createResult.success) {
    console.log('❌ Question creation failed:', createResult.error);
    return false;
  }

  testQuestion = createResult.data;
  console.log('✅ Question created successfully');

  // Get all questions
  const listResult = await makeRequest('GET', '/questions');
  if (!listResult.success) {
    console.log('❌ Getting questions failed:', listResult.error);
    return false;
  }
  console.log('✅ Questions list retrieved successfully');

  // Get specific question
  const getResult = await makeRequest('GET', `/questions/${testQuestion._id}`);
  if (!getResult.success) {
    console.log('❌ Getting question failed:', getResult.error);
    return false;
  }
  console.log('✅ Question retrieved successfully');

  return true;
}

async function testAnswers() {
  console.log('\n💬 Testing Answers...');
  
  const questionData = {
    title: 'Test Question - ' + Date.now(),
    body: 'This is a test question for the Q&A forum system.',
    category: 'Mathematics',
    tags: ['test', 'forum', 'api']
  };

  const answerData = {
    body: 'This is a test answer for the test question.',
  };

  const voteData = {
    targetType: 'question',
    targetId: 'test-question-id',
    voteType: 'up'
  };

  const commentData = {
    body: 'This is a test comment.'
  };

  // Test question creation
  const createQuestion = async () => {
    try {
      const response = await makeRequest('POST', '/questions', questionData, true);
      if (response.success) {
        testQuestion = response.data;
        console.log('✅ Question created successfully:', response.data);
        return true;
      }
      console.log('❌ Question creation failed:', response.error);
      return false;
    } catch (error) {
      console.error('❌ Question creation error:', error.message);
      return false;
    }
  };

  // Test answer creation
  const createAnswer = async () => {
    if (!testQuestion) {
      console.log('❌ Cannot test answer without a question');
      return false;
    }
    
    try {
      const response = await makeRequest('POST', `/answers/question/${testQuestion._id}`, answerData, true);
      if (response.success) {
        testAnswer = response.data;
        console.log('✅ Answer created successfully:', response.data);
        return true;
      }
      console.log('❌ Answer creation failed:', response.error);
      return false;
    } catch (error) {
      console.error('❌ Answer creation error:', error.message);
      return false;
    }
  };

  // Test voting
  const testVote = async () => {
    if (!testQuestion) {
      console.log('❌ Cannot test vote without a question');
      return false;
    }
    
    try {
      const response = await makeRequest('POST', '/votes', voteData, true);
      if (response.success) {
        console.log('✅ Vote cast successfully:', response.data);
        return true;
      }
      console.log('❌ Vote failed:', response.error);
      return false;
    } catch (error) {
      console.error('❌ Vote error:', error.message);
      return false;
    }
  };

  // Test comment creation
  const testComment = async () => {
    if (!testQuestion) {
      console.log('❌ Cannot test comment without a question');
      return false;
    }
    
    try {
      const response = await makeRequest('POST', `/comments/question/${testQuestion._id}`, commentData, true);
      if (response.success) {
        testComment = response.data;
        console.log('✅ Comment created successfully:', response.data);
        return true;
      }
      console.log('❌ Comment failed:', response.error);
      return false;
    } catch (error) {
      console.error('❌ Comment error:', error.message);
      return false;
    }
  };

  if (await createQuestion()) {
    if (await createAnswer()) {
      if (await testVote()) {
        if (await testComment()) {
          return true;
        }
      }
    }
  }
  return false;
}

async function testVotes() {
  console.log('\n👍 Testing Votes...');
  
  if (!testQuestion) {
    console.log('❌ No test question available');
    return false;
  }

  // Upvote question
  const voteData = {
    targetType: 'question',
    targetId: testQuestion._id,
    voteType: 'up'
  };

  const voteResult = await makeRequest('POST', '/votes', voteData, true);
  if (!voteResult.success) {
    console.log('❌ Voting failed:', voteResult.error);
    return false;
  }
  console.log('✅ Vote cast successfully');

  // Get vote counts
  const countsResult = await makeRequest('GET', `/votes/question/${testQuestion._id}`);
  if (!countsResult.success) {
    console.log('❌ Getting vote counts failed:', countsResult.error);
    return false;
  }
  console.log('✅ Vote counts retrieved successfully');

  return true;
}

async function testComments() {
  console.log('\n💭 Testing Comments...');
  
  if (!testQuestion) {
    console.log('❌ No test question available');
    return false;
  }

  // Create a comment
  const commentData = {
    body: 'Great question! I also struggled with this concept.'
  };

  const createResult = await makeRequest('POST', `/comments/question/${testQuestion._id}`, commentData, true);
  if (!createResult.success) {
    console.log('❌ Comment creation failed:', createResult.error);
    return false;
  }
  console.log('✅ Comment created successfully');

  // Get comments for question
  const listResult = await makeRequest('GET', `/comments/question/${testQuestion._id}`);
  if (!listResult.success) {
    console.log('❌ Getting comments failed:', listResult.error);
    return false;
  }
  console.log('✅ Comments list retrieved successfully');

  return true;
}

async function testPoints() {
  console.log('\n🏆 Testing Points System...');
  
  if (!testUser) {
    console.log('❌ No test user available');
    return false;
  }

  // Get user points
  const pointsResult = await makeRequest('GET', `/points/user/${testUser._id}`);
  if (!pointsResult.success) {
    console.log('❌ Getting user points failed:', pointsResult.error);
    return false;
  }
  console.log('✅ User points retrieved successfully');

  // Get leaderboard
  const leaderboardResult = await makeRequest('GET', '/points/leaderboard');
  if (!leaderboardResult.success) {
    console.log('❌ Getting leaderboard failed:', leaderboardResult.error);
    return false;
  }
  console.log('✅ Leaderboard retrieved successfully');

  return true;
}

async function testBadges() {
  console.log('\n🎖️ Testing Badges System...');
  
  // Get all badges
  const badgesResult = await makeRequest('GET', '/badges');
  if (!badgesResult.success) {
    console.log('❌ Getting badges failed:', badgesResult.error);
    return false;
  }
  console.log('✅ Badges list retrieved successfully');

  if (!testUser) {
    console.log('❌ No test user available');
    return false;
  }

  // Get user badges
  const userBadgesResult = await makeRequest('GET', `/badges/user/${testUser._id}`);
  if (!userBadgesResult.success) {
    console.log('❌ Getting user badges failed:', userBadgesResult.error);
    return false;
  }
  console.log('✅ User badges retrieved successfully');

  return true;
}

async function testLeaderboard() {
  console.log('\n📊 Testing Leaderboard...');
  
  // Get overall leaderboard
  const overallResult = await makeRequest('GET', '/leaderboard');
  if (!overallResult.success) {
    console.log('❌ Getting overall leaderboard failed:', overallResult.error);
    return false;
  }
  console.log('✅ Overall leaderboard retrieved successfully');

  // Get subject leaderboard
  const subjectResult = await makeRequest('GET', '/leaderboard/subject/Mathematics');
  if (!subjectResult.success) {
    console.log('❌ Getting subject leaderboard failed:', subjectResult.error);
    return false;
  }
  console.log('✅ Subject leaderboard retrieved successfully');

  // Get badge leaderboard
  const badgeResult = await makeRequest('GET', '/leaderboard/badges');
  if (!badgeResult.success) {
    console.log('❌ Getting badge leaderboard failed:', badgeResult.error);
    return false;
  }
  console.log('✅ Badge leaderboard retrieved successfully');

  return true;
}

async function runTests() {
  console.log('🚀 Starting Q&A Forum and Gamification System Tests...');
  console.log('==========================================');

  const tests = [
    testUserAuth,
    testQuestions,
    testAnswers,
    testVotes,
    testComments,
    testPoints,
    testBadges,
    testLeaderboard
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
      await sleep(500); // Small delay between tests
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
    }
  }

  console.log('\n==========================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The Q&A Forum and Gamification system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }

  // Cleanup
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('Run: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  await runTests();
  process.exit(passedTests === totalTests ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testUserAuth,
  testQuestions,
  testAnswers,
  testVotes,
  testComments,
  testPoints,
  testBadges,
  testLeaderboard
};
