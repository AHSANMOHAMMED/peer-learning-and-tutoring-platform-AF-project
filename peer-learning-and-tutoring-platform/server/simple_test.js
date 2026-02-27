// Simple test to check what's wrong
const Question = require('./models/Question');

async function testQuestion() {
  try {
    console.log('Testing Question model...');
    
    // Try to find questions
    const questions = await Question.find({});
    console.log('Found questions:', questions.length);
    
    // Try to create a test question
    const testQ = new Question({
      title: 'Test Question',
      body: 'Test body',
      subject: 'Mathematics',
      grade: 8,
      author: '507f1f77bcf86cd799439011'
    });
    
    await testQ.save();
    console.log('Test question created');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

testQuestion();
