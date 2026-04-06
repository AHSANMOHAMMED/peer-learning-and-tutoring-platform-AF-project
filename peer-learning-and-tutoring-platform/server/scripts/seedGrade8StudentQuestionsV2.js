require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');

const grade = 8;

const questions = [
  // Mathematics
  {
    subject: 'Mathematics',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] Math ratio simplification',
    body: 'Simplify the ratio 24:36.',
    options: ['2:3', '3:2', '4:6', '12:18'],
    correctAnswer: '2:3',
    explanation: 'Divide both numbers by 12. 24:36 becomes 2:3.',
    tags: ['grade-8', 'student-friendly-v2', 'mathematics', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'Mathematics',
    type: 'mcq',
    difficulty: 'Medium',
    points: 5,
    title: '[G8-STUDENT-V2] Math linear equation',
    body: 'Solve: 3x + 5 = 20',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'],
    correctAnswer: 'x = 5',
    explanation: '3x = 15, so x = 5.',
    tags: ['grade-8', 'student-friendly-v2', 'mathematics', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'Mathematics',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] Math percentage in daily life',
    body: 'A school canteen gives a 15% discount on an item costing Rs. 800. Calculate the discount amount and the final price.',
    options: [],
    correctAnswer: 'Discount = Rs. 120. Final price = Rs. 680.',
    explanation: '15% of 800 is 120. Subtract from 800 to get 680.',
    tags: ['grade-8', 'student-friendly-v2', 'mathematics', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },

  // Science
  {
    subject: 'Science',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] Science states of matter',
    body: 'Which process changes water vapor into liquid water?',
    options: ['Evaporation', 'Condensation', 'Melting', 'Sublimation'],
    correctAnswer: 'Condensation',
    explanation: 'Condensation is gas changing into liquid.',
    tags: ['grade-8', 'student-friendly-v2', 'science', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'Science',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] Science food chain',
    body: 'In a food chain, plants are called:',
    options: ['Consumers', 'Decomposers', 'Producers', 'Predators'],
    correctAnswer: 'Producers',
    explanation: 'Plants produce their own food by photosynthesis.',
    tags: ['grade-8', 'student-friendly-v2', 'science', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'Science',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] Science balanced diet',
    body: 'List four components of a balanced diet and explain why a balanced diet is important for Grade 8 students.',
    options: [],
    correctAnswer: 'A strong answer should include carbohydrates, proteins, fats, vitamins/minerals (any four valid components) and explain growth, energy, and health benefits.',
    explanation: 'This question checks understanding of nutrition and health.',
    tags: ['grade-8', 'student-friendly-v2', 'science', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },

  // History
  {
    subject: 'History',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] History source type',
    body: 'An inscription found on an ancient stone is an example of:',
    options: ['Primary source', 'Secondary source', 'Fiction source', 'Modern media source'],
    correctAnswer: 'Primary source',
    explanation: 'An inscription created in that historical period is a primary source.',
    tags: ['grade-8', 'student-friendly-v2', 'history', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'History',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] History why study history',
    body: 'Give two reasons why studying history is important for school students.',
    options: [],
    correctAnswer: 'A good answer should mention understanding past events, learning from mistakes, building identity/citizenship, and decision-making.',
    explanation: 'This tests reasoning on social relevance of history.',
    tags: ['grade-8', 'student-friendly-v2', 'history', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },

  // Geography
  {
    subject: 'Geography',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] Geography map scale',
    body: 'On a map, what does a scale help you find?',
    options: ['Color of roads', 'Distance between places', 'Population only', 'Temperature only'],
    correctAnswer: 'Distance between places',
    explanation: 'Map scales convert map measurements to real-world distances.',
    tags: ['grade-8', 'student-friendly-v2', 'geography', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'Geography',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] Geography weather vs climate',
    body: 'Differentiate weather and climate with one real-life example for each.',
    options: [],
    correctAnswer: 'Weather is short-term atmospheric condition (e.g., rain today). Climate is long-term pattern of a region (e.g., tropical climate).',
    explanation: 'This checks concept clarity and application.',
    tags: ['grade-8', 'student-friendly-v2', 'geography', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },

  // ICT
  {
    subject: 'ICT',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] ICT input device',
    body: 'Which of the following is an input device?',
    options: ['Monitor', 'Keyboard', 'Printer', 'Speaker'],
    correctAnswer: 'Keyboard',
    explanation: 'A keyboard is used to input data into a computer.',
    tags: ['grade-8', 'student-friendly-v2', 'ict', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },
  {
    subject: 'ICT',
    type: 'mcq',
    difficulty: 'Medium',
    points: 5,
    title: '[G8-STUDENT-V2] ICT phishing awareness',
    body: 'What is the safest action if you receive a suspicious email asking for your password?',
    options: ['Reply with password', 'Click the link quickly', 'Delete/report the email', 'Forward to friends'],
    correctAnswer: 'Delete/report the email',
    explanation: 'Suspicious emails can be phishing attempts; never share credentials.',
    tags: ['grade-8', 'student-friendly-v2', 'ict', 'medium-english', 'medium-tamil', 'medium-sinhala']
  },

  // English Language
  {
    subject: 'English Language',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] English tense',
    body: 'Choose the correct sentence in simple past tense.',
    options: ['She go to school yesterday.', 'She went to school yesterday.', 'She goes to school yesterday.', 'She going to school yesterday.'],
    correctAnswer: 'She went to school yesterday.',
    explanation: 'Simple past of "go" is "went".',
    tags: ['grade-8', 'student-friendly-v2', 'english-language', 'medium-english']
  },
  {
    subject: 'English Language',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] English paragraph writing',
    body: 'Write a short paragraph (5-6 sentences) about how you help keep your classroom clean.',
    options: [],
    correctAnswer: 'A good answer should include clear sentences, correct tense, and practical actions done by the student.',
    explanation: 'Assesses sentence construction and coherent writing.',
    tags: ['grade-8', 'student-friendly-v2', 'english-language', 'medium-english']
  },

  // Tamil
  {
    subject: 'Tamil',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] தமிழ் இலக்கணம் - வினைச்சொல்',
    body: 'கீழே உள்ளவற்றில் வினைச்சொல் எது?',
    options: ['மரம்', 'வீடு', 'படிக்கிறான்', 'அழகு'],
    correctAnswer: 'படிக்கிறான்',
    explanation: '"படிக்கிறான்" என்பது செயலைக் குறிக்கும் வினைச்சொல்.',
    tags: ['grade-8', 'student-friendly-v2', 'tamil', 'medium-tamil']
  },
  {
    subject: 'Tamil',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] தமிழ் கடிதம்',
    body: 'உங்கள் நண்பருக்கு பள்ளி நிகழ்ச்சி பற்றி 5-6 வரிகளில் ஒரு சுருக்கமான கடிதம் எழுதுங்கள்.',
    options: [],
    correctAnswer: 'சரியான பதில் கடித வடிவம், தெளிவு, மற்றும் பொருத்தமான கருத்துகளைக் கொண்டிருக்க வேண்டும்.',
    explanation: 'இது எழுதுதல் திறன் மற்றும் கருத்து வெளிப்பாட்டை மதிப்பிடுகிறது.',
    tags: ['grade-8', 'student-friendly-v2', 'tamil', 'medium-tamil']
  },

  // Sinhala
  {
    subject: 'Sinhala',
    type: 'mcq',
    difficulty: 'Easy',
    points: 5,
    title: '[G8-STUDENT-V2] සිංහල ව්‍යාකරණය - ක්‍රියා පදය',
    body: 'පහත වචන අතරින් ක්‍රියා පදය කුමක්ද?',
    options: ['ගස', 'පොත', 'දුවයි', 'ලස්සන'],
    correctAnswer: 'දුවයි',
    explanation: '"දුවයි" යනු ක්‍රියාවක් දැක්වෙන ක්‍රියා පදයකි.',
    tags: ['grade-8', 'student-friendly-v2', 'sinhala', 'medium-sinhala']
  },
  {
    subject: 'Sinhala',
    type: 'structured',
    difficulty: 'Medium',
    points: 10,
    title: '[G8-STUDENT-V2] සිංහල කෙටි රචනය',
    body: 'ඔබගේ පාසලේ ක්‍රීඩා උළෙල පිළිබඳ වාක්‍ය 5-6ක කෙටි රචනයක් ලියන්න.',
    options: [],
    correctAnswer: 'හොඳ පිළිතුරක සිදුවීම් අනුපිළිවෙල, පැහැදිලි අදහස් සහ නිවැරදි වාක්‍ය ව්‍යුහය තිබිය යුතුය.',
    explanation: 'මෙය ලිවීමේ හැකියාව සහ අදහස් සංවිධානය පරීක්ෂා කරයි.',
    tags: ['grade-8', 'student-friendly-v2', 'sinhala', 'medium-sinhala']
  }
];

async function getAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) author = await User.findOne({ role: 'tutor', isActive: true });

  if (!author) {
    author = await User.create({
      username: 'grade8_student_v2_seed_admin',
      email: 'grade8.student.v2.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: { firstName: 'Grade8', lastName: 'StudentSetV2' }
    });
  }

  return author;
}

async function upsertQuestion(author, q) {
  const existing = await Question.findOne({ grade, subject: q.subject, title: q.title });
  if (existing) return false;

  await Question.create({
    title: q.title,
    body: q.body,
    subject: q.subject,
    grade,
    author: author._id,
    type: q.type,
    difficulty: q.difficulty,
    points: q.points,
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    tags: q.tags || ['grade-8', 'student-friendly-v2']
  });

  return true;
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);
  const author = await getAuthor();

  let created = 0;
  for (const q of questions) {
    const ok = await upsertQuestion(author, q);
    if (ok) created += 1;
  }

  console.log(`Grade 8 student-friendly v2 seeding complete. Questions created: ${created}`);
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Grade 8 student-friendly v2 seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
