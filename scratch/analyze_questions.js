const mongoose = require('mongoose');
const Question = require('./backend/models/Question');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function analyzeQuestions() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const questions = await Question.find({});
  console.log(`Total questions: ${questions.length}`);

  const subjects = {};
  const languages = { sinhala: 0, tamil: 0, english: 0 };

  questions.forEach(q => {
    subjects[q.subject] = (subjects[q.subject] || 0) + 1;
    
    const text = (q.title + ' ' + q.body).toLowerCase();
    // Simple heuristic for language detection
    if (/[අ-ෆ]/.test(text)) languages.sinhala++;
    else if (/[அ-ஹ]/.test(text)) languages.tamil++;
    else languages.english++;
  });

  console.log('Subjects distribution:', subjects);
  console.log('Detected languages (heuristic):', languages);

  process.exit(0);
}

analyzeQuestions().catch(err => {
  console.error(err);
  process.exit(1);
});
