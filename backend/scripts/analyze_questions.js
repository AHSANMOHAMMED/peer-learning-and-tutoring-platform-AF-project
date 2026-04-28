const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');
// If running from backend directory, .env is in the current directory
require('dotenv').config({ path: './.env' });

async function analyzeQuestions() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('URI found:', uri ? uri.substring(0, 20) + '...' : 'NONE');
  
  if (!uri) {
      console.error('MONGO_URI or MONGODB_URI not found in .env');
      process.exit(1);
  }
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const questions = await Question.find({});
    console.log(`Total questions: ${questions.length}`);

    const subjects = {};
    const languages = { sinhala: 0, tamil: 0, english: 0 };

    questions.forEach(q => {
      subjects[q.subject] = (subjects[q.subject] || 0) + 1;
      
      const text = (q.title + ' ' + (q.body || '')).toLowerCase();
      if (/[අ-ෆ]/.test(text)) languages.sinhala++;
      else if (/[அ-ஹ]/.test(text)) languages.tamil++;
      else languages.english++;
    });

    console.log('Subjects distribution:', subjects);
    console.log('Detected languages (heuristic):', languages);
  } catch (err) {
    console.error('Connection error:', err);
  }

  process.exit(0);
}

analyzeQuestions().catch(err => {
  console.error(err);
  process.exit(1);
});
