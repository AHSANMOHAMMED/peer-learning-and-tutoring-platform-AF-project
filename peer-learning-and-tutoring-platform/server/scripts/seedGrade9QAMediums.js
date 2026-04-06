require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const grade = 9;
const mediums = ['English', 'Tamil', 'Sinhala'];

const subjects = [
  'Sinhala',
  'Tamil',
  'English Language',
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Civic Education',
  'Life Competencies and Citizenship Education',
  'Buddhism',
  'Christianity',
  'Catholicism',
  'Hinduism',
  'Art',
  'Dancing',
  'Eastern Music',
  'Western Music',
  'Health & Physical Education',
  'Practical & Technical Skills',
  'ICT'
];

const mediumPrompt = {
  English: {
    body: (subject) => `Explain one key Grade 9 concept in ${subject} and give a practical example.`,
    answer: (subject) => `A good answer defines one Grade 9 concept in ${subject}, explains it clearly, and provides one real-world example.`
  },
  Tamil: {
    body: (subject) => `${subject} பாடத்தில் 9ஆம் வகுப்புக்கான ஒரு முக்கிய கருத்தை விளக்கி, ஒரு நடைமுறை எடுத்துக்காட்டு கொடுக்கவும்.`,
    answer: (subject) => `${subject} பாடத்தின் முக்கிய கருத்தை தெளிவாக விளக்கி, தினசரி வாழ்க்கையுடன் தொடர்புடைய எடுத்துக்காட்டு கொடுக்க வேண்டும்.`
  },
  Sinhala: {
    body: (subject) => `${subject} විෂයේ 9 ශ්රේණියට අදාළ ප්රධාන සංකල්පයක් පැහැදිලි කර ප්රායෝගික උදාහරණයක් දෙන්න.`,
    answer: (subject) => `${subject} විෂයේ ප්රධාන සංකල්පයක් නිවැරදිව පැහැදිලි කර දෛනික ජීවිතයට සම්බන්ධ උදාහරණයක් ලබා දිය යුතුය.`
  }
};

async function getSeedAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) {
    author = await User.findOne({ role: 'tutor', isActive: true });
  }

  if (!author) {
    author = new User({
      username: 'grade9_seed_admin',
      email: 'grade9.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: {
        firstName: 'Grade9',
        lastName: 'Seeder'
      }
    });
    await author.save();
    console.log('Created fallback seed author: grade9.seed.admin@peerlearn.com');
  }

  return author;
}

async function upsertQuestionWithAnswer(author, subject, medium) {
  const title = `[Grade 9][${medium}] ${subject} practice question`;
  const tags = ['grade-9', `medium-${medium.toLowerCase()}`, 'seeded'];

  let question = await Question.findOne({ grade, subject, title });
  let createdQuestion = false;

  if (!question) {
    question = await Question.create({
      title,
      body: mediumPrompt[medium].body(subject),
      subject,
      grade,
      author: author._id,
      tags,
      type: 'structured',
      difficulty: 'Easy',
      points: 5,
      correctAnswer: mediumPrompt[medium].answer(subject),
      explanation: `Seeded Grade 9 ${medium} question for ${subject}.`
    });
    createdQuestion = true;
  }

  const answerBody = `[Seeded ${medium}] ${mediumPrompt[medium].answer(subject)}`;
  let answer = await Answer.findOne({ question: question._id, body: answerBody });
  let createdAnswer = false;

  if (!answer) {
    answer = await Answer.create({
      body: answerBody,
      question: question._id,
      author: author._id,
      isAccepted: true,
      status: 'correct',
      tutorComment: `Reference answer for ${medium} medium.`
    });
    createdAnswer = true;
  }

  if (!question.hasAcceptedAnswer || question.answerCount < 1) {
    question.hasAcceptedAnswer = true;
    question.answerCount = Math.max(question.answerCount || 0, 1);
    await question.save();
  }

  return { createdQuestion, createdAnswer };
}

async function seedGrade9QAMediums() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  console.log('Connected to MongoDB');
  const author = await getSeedAuthor();

  let questionsCreated = 0;
  let answersCreated = 0;

  for (const subject of subjects) {
    for (const medium of mediums) {
      const { createdQuestion, createdAnswer } = await upsertQuestionWithAnswer(author, subject, medium);
      if (createdQuestion) questionsCreated += 1;
      if (createdAnswer) answersCreated += 1;
    }
  }

  console.log(`Grade 9 seeding complete. Questions created: ${questionsCreated}, answers created: ${answersCreated}`);
  await mongoose.connection.close();
}

seedGrade9QAMediums().catch(async (error) => {
  console.error('Grade 9 QA seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
