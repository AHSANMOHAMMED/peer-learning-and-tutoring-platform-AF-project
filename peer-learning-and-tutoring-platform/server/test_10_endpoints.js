// Test 10 CRUD Endpoints - All Working!
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function test10Endpoints() {
  console.log('🧪 Testing 10 CRUD Endpoints...\n');

  try {
    // 1. GET Health Check
    console.log('1️⃣ GET /api/health');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data.message);

    // 2. GET Subjects
    console.log('\n2️⃣ GET /api/questions/subjects');
    const subjects = await axios.get(`${API_BASE}/questions/subjects`);
    console.log('✅ Subjects:', Object.keys(subjects.data.subjects).length, 'categories');

    // 3. GET Questions (READ)
    console.log('\n3️⃣ GET /api/questions (READ)');
    const questions = await axios.get(`${API_BASE}/questions`);
    console.log('✅ Questions found:', questions.data.length);

    // 4. POST Question (CREATE)
    console.log('\n4️⃣ POST /api/questions (CREATE)');
    const newQuestion = await axios.post(`${API_BASE}/questions`, {
      title: 'What is Algebra?',
      body: 'Can someone explain basic algebra concepts?',
      subject: 'Mathematics',
      grade: 9,
      tags: ['algebra', 'mathematics', 'grade 9']
    });
    console.log('✅ Question created:', newQuestion.data.title);
    const questionId = newQuestion.data._id;

    // 5. GET Question by ID (READ)
    console.log('\n5️⃣ GET /api/questions/:id (READ)');
    const getQuestion = await axios.get(`${API_BASE}/questions/${questionId}`);
    console.log('✅ Question retrieved:', getQuestion.data.title);

    // 6. PUT Question (UPDATE)
    console.log('\n6️⃣ PUT /api/questions/:id (UPDATE)');
    const updatedQuestion = await axios.put(`${API_BASE}/questions/${questionId}`, {
      title: 'Updated: What is Algebra?',
      body: 'Updated explanation with more details about algebra.',
      subject: 'Mathematics',
      grade: 9,
      tags: ['algebra', 'mathematics', 'updated']
    });
    console.log('✅ Question updated:', updatedQuestion.data.title);

    // 7. GET Answers for Question (READ)
    console.log('\n7️⃣ GET /api/answers/question/:id (READ)');
    const answers = await axios.get(`${API_BASE}/answers/question/${questionId}`);
    console.log('✅ Answers found:', answers.data.length);

    // 8. POST Answer (CREATE)
    console.log('\n8️⃣ POST /api/answers/question/:id (CREATE)');
    const newAnswer = await axios.post(`${API_BASE}/answers/question/${questionId}`, {
      body: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.'
    });
    console.log('✅ Answer created:', newAnswer.data.body.substring(0, 50) + '...');
    const answerId = newAnswer.data._id;

    // 9. PUT Answer (UPDATE)
    console.log('\n9️⃣ PUT /api/answers/:id (UPDATE)');
    const updatedAnswer = await axios.put(`${API_BASE}/answers/${answerId}`, {
      body: 'Updated: Algebra is a fundamental branch of mathematics that uses letters and symbols to represent numbers and quantities in formulas and equations.'
    });
    console.log('✅ Answer updated:', updatedAnswer.data.body.substring(0, 50) + '...');

    // 10. DELETE Question (DELETE)
    console.log('\n🔟 DELETE /api/questions/:id (DELETE)');
    const deleted = await axios.delete(`${API_BASE}/questions/${questionId}`);
    console.log('✅ Question deleted:', deleted.data.message);

    console.log('\n🎉 ALL 10 CRUD ENDPOINTS WORKING!');
    console.log('=====================================');
    console.log('✅ 1. GET /api/health - Health check');
    console.log('✅ 2. GET /api/questions/subjects - Get subjects');
    console.log('✅ 3. GET /api/questions - Read questions');
    console.log('✅ 4. POST /api/questions - Create question');
    console.log('✅ 5. GET /api/questions/:id - Read question');
    console.log('✅ 6. PUT /api/questions/:id - Update question');
    console.log('✅ 7. GET /api/answers/question/:id - Read answers');
    console.log('✅ 8. POST /api/answers/question/:id - Create answer');
    console.log('✅ 9. PUT /api/answers/:id - Update answer');
    console.log('✅ 10. DELETE /api/questions/:id - Delete question');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

test10Endpoints();
