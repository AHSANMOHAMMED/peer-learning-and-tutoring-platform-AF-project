require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');

const grade = 8;

const curatedQuestions = [
  {
    subject: 'Mathematics',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Fractions with unlike denominators',
    body: 'What is 3/4 + 2/3?',
    options: ['17/12', '13/12', '5/7', '1 1/12'],
    correctAnswer: '17/12',
    explanation: 'LCM of 4 and 3 is 12. So 3/4 = 9/12 and 2/3 = 8/12. Sum is 17/12.'
  },
  {
    subject: 'Mathematics',
    type: 'mcq',
    difficulty: 'Medium',
    points: 5,
    title: '[G8-CURATED] Area of rectangle',
    body: 'A rectangle has length 12 cm and width 7 cm. What is its area?',
    options: ['19 cm2', '84 cm2', '38 cm2', '168 cm2'],
    correctAnswer: '84 cm2',
    explanation: 'Area = length x width = 12 x 7 = 84 cm2.'
  },
  {
    subject: 'Science',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Photosynthesis requirement',
    body: 'Which gas do plants use during photosynthesis?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
    correctAnswer: 'Carbon dioxide',
    explanation: 'Plants take in carbon dioxide and water to make food in the presence of sunlight.'
  },
  {
    subject: 'Science',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-CURATED] Human digestive system function',
    body: 'Name two organs in the human digestive system and explain one function of each organ.',
    options: [],
    correctAnswer: 'A complete answer should name two valid organs (e.g., mouth, stomach, small intestine, liver) and explain correct functions for each.',
    explanation: 'This tests understanding of organs and their roles in digestion.'
  },
  {
    subject: 'History',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Sources of history',
    body: 'Which of the following is a primary historical source?',
    options: ['A modern textbook summary', 'A diary written during that period', 'A blog post from today', 'A school worksheet'],
    correctAnswer: 'A diary written during that period',
    explanation: 'Primary sources are original records created at the time of events.'
  },
  {
    subject: 'Geography',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Latitude and climate',
    body: 'Places near the equator are usually:',
    options: ['Very cold all year', 'Warm and humid', 'Dry all year', 'Covered by glaciers'],
    correctAnswer: 'Warm and humid',
    explanation: 'The equatorial region gets direct sunlight for most of the year.'
  },
  {
    subject: 'ICT',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Safe password practice',
    body: 'Which password is strongest?',
    options: ['12345678', 'mypassword', 'N!9q$7Lm', 'abcdefg'],
    correctAnswer: 'N!9q$7Lm',
    explanation: 'Strong passwords combine uppercase, lowercase, symbols, and numbers.'
  },
  {
    subject: 'English Language',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] Parts of speech',
    body: 'Choose the adjective in this sentence: "The quick fox jumped over the wall."',
    options: ['fox', 'jumped', 'quick', 'wall'],
    correctAnswer: 'quick',
    explanation: '"Quick" describes the noun "fox", so it is an adjective.'
  },
  {
    subject: 'Tamil',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] தமிழ் இலக்கணம் - பெயர்ச்சொல்',
    body: 'கீழ்காணும் சொற்களில் பெயர்ச்சொல் எது?',
    options: ['ஓடு', 'அழகு', 'மரம்', 'வேகமாக'],
    correctAnswer: 'மரம்',
    explanation: '"மரம்" என்பது ஒரு பொருளின் பெயரை குறிக்கும் பெயர்ச்சொல்.'
  },
  {
    subject: 'Tamil',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-CURATED] தமிழ் வாசிப்பு புரிதல்',
    body: 'உங்களுக்கு பிடித்த ஒரு தமிழ் கதையை 4-5 வரிகளில் சுருக்கமாக எழுதுங்கள்.',
    options: [],
    correctAnswer: 'சரியான பதில் கதையின் முக்கிய நிகழ்வுகள், பாத்திரம் மற்றும் கருத்தை தெளிவாகச் சொல்ல வேண்டும்.',
    explanation: 'இது வாசிப்பு புரிதல் மற்றும் சுருக்க எழுத்துத் திறனை மதிப்பிடுகிறது.'
  },
  {
    subject: 'Sinhala',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-CURATED] සිංහල ව්‍යාකරණය - නාම පදය',
    body: 'පහත වචන අතරින් නාම පදය කුමක්ද?',
    options: ['දුවන්න', 'අලංකාර', 'ගස', 'වේගයෙන්'],
    correctAnswer: 'ගස',
    explanation: '"ගස" යනු දේවල් නම් කරන නාම පදයකි.'
  }
];

async function getAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) author = await User.findOne({ role: 'tutor', isActive: true });

  if (!author) {
    author = await User.create({
      username: 'grade8_curated_seed_admin',
      email: 'grade8.curated.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: {
        firstName: 'Grade8',
        lastName: 'CuratedSeeder'
      }
    });
  }

  return author;
}

async function upsertQuestion(author, payload) {
  const tags = ['grade-8', 'curated-logical-v1', 'reviewed'];

  const existing = await Question.findOne({
    grade,
    subject: payload.subject,
    title: payload.title
  });

  if (existing) return false;

  await Question.create({
    title: payload.title,
    body: payload.body,
    subject: payload.subject,
    grade,
    author: author._id,
    type: payload.type,
    difficulty: payload.difficulty,
    points: payload.points,
    options: Array.isArray(payload.options) ? payload.options : [],
    correctAnswer: payload.correctAnswer,
    explanation: payload.explanation,
    tags
  });

  return true;
}

async function seedGrade8LogicalQuestions() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  const author = await getAuthor();
  let created = 0;

  for (const payload of curatedQuestions) {
    const wasCreated = await upsertQuestion(author, payload);
    if (wasCreated) created += 1;
  }

  console.log(`Grade 8 curated seeding complete. Questions created: ${created}`);
  await mongoose.connection.close();
}

seedGrade8LogicalQuestions().catch(async (error) => {
  console.error('Grade 8 curated seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
