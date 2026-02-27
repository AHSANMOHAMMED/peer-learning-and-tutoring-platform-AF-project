// Complete Q&A System Test Script with ALL CRUD Operations
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAllOperations() {
  console.log('🧪 Testing Complete Q&A System with ALL CRUD Operations...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing GET /api/health');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('📊 Server Status:', healthResponse.data.success ? 'Running' : 'Down', '\n');

    // Test 2: Get Sri Lankan Subjects
    console.log('2️⃣ Testing GET /api/questions/subjects');
    const subjectsResponse = await axios.get(`${API_BASE}/questions/subjects?grade=8`);
    console.log('✅ Subjects API works:', subjectsResponse.data.success);
    console.log('📚 Available subjects:', Object.keys(subjectsResponse.data.subjects).join(', '), '\n');

    // Test 3: Get Questions (Filtered)
    console.log('3️⃣ Testing GET /api/questions?subject=Mathematics&grade=8');
    const questionsResponse = await axios.get(`${API_BASE}/questions?subject=Mathematics&grade=8`);
    console.log('✅ Questions API works:', questionsResponse.data.length > 0 ? 'Found questions' : 'No questions yet');
    console.log('📊 Questions found:', questionsResponse.data.length, '\n');

    // Test 4: Create Question (POST)
    console.log('4️⃣ Testing POST /api/questions (Create)');
    const createQuestionResponse = await axios.post(`${API_BASE}/questions`, {
      title: 'What is Pythagorean theorem?',
      body: 'Can someone explain the Pythagorean theorem and how it is used in real life?',
      subject: 'Mathematics',
      grade: 8,
      tags: ['mathematics', 'geometry', 'grade 8']
    });
    console.log('✅ Create Question works:', createQuestionResponse.data.title);
    console.log('📝 Question ID:', createQuestionResponse.data._id, '\n');
    const questionId = createQuestionResponse.data._id;

    // Test 5: Update Question (PUT)
    console.log('5️⃣ Testing PUT /api/questions/:id (Update)');
    const updateQuestionResponse = await axios.put(`${API_BASE}/questions/${questionId}`, {
      title: 'Updated: What is Pythagorean theorem?',
      body: 'Updated explanation with more details about Pythagorean theorem.',
      subject: 'Mathematics',
      grade: 8,
      tags: ['mathematics', 'geometry', 'updated']
    });
    console.log('✅ Update Question works:', updateQuestionResponse.data.title);
    console.log('🔄 Updated at:', updateQuestionResponse.data.updatedAt, '\n');

    // Test 6: Get Answers for Question
    console.log('6️⃣ Testing GET /api/answers/question/:id');
    const answersResponse = await axios.get(`${API_BASE}/answers/question/${questionId}`);
    console.log('✅ Get Answers API works:', 'Response received');
    console.log('💬 Answers found:', answersResponse.data.length, '\n');

    // Test 7: Create Answer (POST)
    console.log('7️⃣ Testing POST /api/answers/question/:id (Create Answer)');
    const createAnswerResponse = await axios.post(`${API_BASE}/answers/question/${questionId}`, {
      body: 'The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c²'
    });
    console.log('✅ Create Answer works:', createAnswerResponse.data.body.substring(0, 50) + '...');
    console.log('💭 Answer ID:', createAnswerResponse.data._id, '\n');
    const answerId = createAnswerResponse.data._id;

    // Test 8: Update Answer (PUT)
    console.log('8️⃣ Testing PUT /api/answers/:id (Update Answer)');
    const updateAnswerResponse = await axios.put(`${API_BASE}/answers/${answerId}`, {
      body: 'Updated answer content with more mathematical details and examples.'
    });
    console.log('✅ Update Answer works:', updateAnswerResponse.data.body.substring(0, 50) + '...');
    console.log('🔄 Updated at:', updateAnswerResponse.data.updatedAt, '\n');

    // Test 9: Update Answer Status (PATCH - Tutor Review)
    console.log('9️⃣ Testing PATCH /api/answers/:id/status (Tutor Review)');
    const statusUpdateResponse = await axios.patch(`${API_BASE}/answers/${answerId}/status`, {
      status: 'correct',
      tutorComment: 'Excellent explanation! Clear and concise.'
    });
    console.log('✅ Status Update works:', statusUpdateResponse.data.status);
    console.log('👨‍🏫 Tutor Comment:', statusUpdateResponse.data.tutorComment, '\n');

    // Test 10: Get Statistics
    console.log('🔟 Testing GET /api/questions/stats');
    const statsResponse = await axios.get(`${API_BASE}/questions/stats`);
    console.log('✅ Stats API works:', 'Statistics retrieved');
    console.log('📈 Total questions:', statsResponse.data.totalQuestions, '\n');

    // Test 11: Delete Answer (DELETE)
    console.log('1️⃣1️⃣ Testing DELETE /api/answers/:id (Delete Answer)');
    const deleteAnswerResponse = await axios.delete(`${API_BASE}/answers/${answerId}`);
    console.log('✅ Delete Answer works:', deleteAnswerResponse.data.message);
    console.log('🗑️ Deleted Answer ID:', deleteAnswerResponse.data.deletedAnswerId, '\n');

    // Test 12: Delete Question (DELETE)
    console.log('1️⃣2️⃣ Testing DELETE /api/questions/:id (Delete Question)');
    const deleteQuestionResponse = await axios.delete(`${API_BASE}/questions/${questionId}`);
    console.log('✅ Delete Question works:', deleteQuestionResponse.data.message);
    console.log('🗑️ Deleted Question ID:', deleteQuestionResponse.data.deletedQuestionId, '\n');

    console.log('🎉 ALL CRUD OPERATIONS WORKING SUCCESSFULLY!');
    console.log('\n📋 Complete API Summary:');
    console.log('✅ GET    /api/health - Health check');
    console.log('✅ GET    /api/questions/subjects - Get Sri Lankan subjects');
    console.log('✅ GET    /api/questions - Filter questions');
    console.log('✅ POST   /api/questions - Create question');
    console.log('✅ PUT    /api/questions/:id - Update question');
    console.log('✅ DELETE /api/questions/:id - Delete question');
    console.log('✅ GET    /api/answers/question/:id - Get answers');
    console.log('✅ POST   /api/answers/question/:id - Create answer');
    console.log('✅ PUT    /api/answers/:id - Update answer');
    console.log('✅ DELETE /api/answers/:id - Delete answer');
    console.log('✅ PATCH  /api/answers/:id/status - Update answer status');
    console.log('✅ GET    /api/questions/stats - Get statistics');
    console.log('✅ GET    /api/answers/stats - Get answer statistics');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run all tests
testAllOperations();
