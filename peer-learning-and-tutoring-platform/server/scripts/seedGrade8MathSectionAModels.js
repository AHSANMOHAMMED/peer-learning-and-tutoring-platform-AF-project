require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');

const grade = 8;
const subject = 'Mathematics';

const modelQuestions = [
  {
    title: '[G8-MATH-SECTION-A] Prime factors of 99 and 120',
    body: 'Find the prime factors of 99, and write 120 as a product of its prime factors.',
    type: 'structured',
    difficulty: 'Easy',
    points: 10,
    options: [],
    correctAnswer: '99 = 3 x 3 x 11 = 3^2 x 11. 120 = 2 x 2 x 2 x 3 x 5 = 2^3 x 3 x 5.',
    explanation: 'Prime factorization means expressing a number as a product of prime numbers only.'
  },
  {
    title: '[G8-MATH-SECTION-A] Reciprocal of a rational number',
    body: 'Find the reciprocal of -7/9.',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    options: ['9/7', '-9/7', '-7/9', '7/9'],
    correctAnswer: '-9/7',
    explanation: 'The reciprocal of a/b is b/a. For -7/9, reciprocal is -9/7.'
  },
  {
    title: '[G8-MATH-SECTION-A] Simplification of rational expression',
    body: 'Simplify: (3/4 + 5/8) - 1/2',
    type: 'mcq',
    difficulty: 'Medium',
    points: 5,
    options: ['5/8', '7/8', '9/8', '11/8'],
    correctAnswer: '7/8',
    explanation: '3/4 = 6/8. Then 6/8 + 5/8 = 11/8. Next 11/8 - 1/2 (4/8) = 7/8.'
  },
  {
    title: '[G8-MATH-SECTION-A] Product of rational numbers and property',
    body: 'Calculate (-3/5) x (10/9) and name the property shown by the result for rational numbers.',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    options: [],
    correctAnswer: '(-3/5) x (10/9) = -30/45 = -2/3. Property: Closure property of multiplication for rational numbers.',
    explanation: 'The product of two rational numbers is always a rational number.'
  }
];

async function getAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) author = await User.findOne({ role: 'tutor', isActive: true });

  if (!author) {
    author = await User.create({
      username: 'grade8_math_section_a_seed_admin',
      email: 'grade8.math.sectiona.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: { firstName: 'Grade8', lastName: 'MathSectionA' }
    });
  }

  return author;
}

async function upsertQuestion(author, payload) {
  const existing = await Question.findOne({
    grade,
    subject,
    title: payload.title
  });

  if (existing) return false;

  await Question.create({
    title: payload.title,
    body: payload.body,
    subject,
    grade,
    author: author._id,
    type: payload.type,
    difficulty: payload.difficulty,
    points: payload.points,
    options: payload.options,
    correctAnswer: payload.correctAnswer,
    explanation: payload.explanation,
    tags: ['grade-8', 'math-section-a-models-v1', 'student-friendly-v2', 'mathematics', 'medium-english', 'medium-tamil', 'medium-sinhala']
  });

  return true;
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  const author = await getAuthor();
  let created = 0;

  for (const q of modelQuestions) {
    const ok = await upsertQuestion(author, q);
    if (ok) created += 1;
  }

  console.log(`Grade 8 Math Section A seeding complete. Questions created: ${created}`);
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Grade 8 Math Section A seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
