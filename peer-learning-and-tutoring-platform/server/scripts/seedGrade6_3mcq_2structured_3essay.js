require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const grade = 6;
const mediums = ['English', 'Tamil', 'Sinhala'];

const subjects = [
  'Mathematics',
  'Science',
  'Sinhala',
  'Tamil',
  'English Language',
  'History',
  'Geography',
  'Civic Education',
  'Buddhism',
  'Hinduism',
  'Islam',
  'Christianity',
  'ICT',
  'Art',
  'Dancing',
  'Music',
  'Drama & Theatre'
];

const tamilSubjectName = {
  Mathematics: 'கணிதம்',
  Science: 'அறிவியல்',
  Sinhala: 'சிங்களம்',
  Tamil: 'தமிழ்',
  'English Language': 'ஆங்கில மொழி',
  History: 'வரலாறு',
  Geography: 'புவியியல்',
  'Civic Education': 'நகராட்சி கல்வி',
  Buddhism: 'புத்த மதம்',
  Hinduism: 'இந்து மதம்',
  Islam: 'இஸ்லாம்',
  Christianity: 'கிறிஸ்தவம்',
  ICT: 'தகவல் மற்றும் தொடர்பு தொழில்நுட்பம்',
  Art: 'கலை',
  Dancing: 'நடனம்',
  Music: 'இசை',
  'Drama & Theatre': 'நாடகம் மற்றும் மேடை'
};

const sinhalaSubjectName = {
  Mathematics: 'ගණිතය',
  Science: 'විද්‍යාව',
  Sinhala: 'සිංහල',
  Tamil: 'තමිළ',
  'English Language': 'ඉංග්‍රීසි භාෂාව',
  History: 'ඉතිහාසය',
  Geography: 'භූගෝලය',
  'Civic Education': 'නාගරික අධ්‍යාපනය',
  Buddhism: 'බුද්ධාගම',
  Hinduism: 'හින්දු ආගම',
  Islam: 'ඉස්ලාම්',
  Christianity: 'ක්‍රිස්තියානි ආගම',
  ICT: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය',
  Art: 'කලාව',
  Dancing: 'නර්තනය',
  Music: 'සංගීතය',
  'Drama & Theatre': 'නාට්‍යය සහ රංගනය'
};

const neighborSubjects = ['Mathematics', 'Science', 'History', 'Geography', 'English Language'];

const getSubjectLabel = (subject, medium) => {
  if (medium === 'Tamil') return tamilSubjectName[subject] || subject;
  if (medium === 'Sinhala') return sinhalaSubjectName[subject] || subject;
  return subject;
};

const buildMcqQuestion = (subject, medium, index) => {
  const subjectLabel = getSubjectLabel(subject, medium);
  const distractors = neighborSubjects.filter((s) => s !== subject).slice(0, 3);
  const optionsBase = [subject, ...distractors];

  if (medium === 'Tamil') {
    return {
      type: 'mcq',
      title: `[Grade 6][Tamil][Pack-323][MCQ ${index}] ${subject} கருத்து`,
      body: `கீழே உள்ள தேர்வுகளில் ${subjectLabel} பாடத்தைச் சேர்ந்த சரியான பதிலைத் தேர்வு செய்யவும்.`,
      options: optionsBase,
      correctAnswer: subject,
      explanation: `${subjectLabel} பாடத்திற்கு சரியான விடை ${subject} ஆகும்.`,
      difficulty: 'Easy',
      points: 5
    };
  }

  if (medium === 'Sinhala') {
    return {
      type: 'mcq',
      title: `[Grade 6][Sinhala][Pack-323][MCQ ${index}] ${subject} සංකල්පය`,
      body: `පහත විකල්පවලින් ${subjectLabel} විෂයට අයත් නිවැරදි පිළිතුර තෝරන්න.`,
      options: optionsBase,
      correctAnswer: subject,
      explanation: `${subjectLabel} විෂයට නිවැරදි පිළිතුර ${subject} වේ.`,
      difficulty: 'Easy',
      points: 5
    };
  }

  return {
    type: 'mcq',
    title: `[Grade 6][English][Pack-323][MCQ ${index}] ${subject} concept`,
    body: `Select the option that best matches the Grade 6 ${subjectLabel} topic.`,
    options: optionsBase,
    correctAnswer: subject,
    explanation: `The correct choice is ${subject}, which matches this topic.`,
    difficulty: 'Easy',
    points: 5
  };
};

const buildStructuredQuestion = (subject, medium, index) => {
  const subjectLabel = getSubjectLabel(subject, medium);

  if (medium === 'Tamil') {
    return {
      type: 'structured',
      title: `[Grade 6][Tamil][Pack-323][STR ${index}] ${subject} பயன்பாடு`,
      body: `${subjectLabel} பாடத்தில் கற்ற இரண்டு அடிப்படை கருத்துகளை எழுதவும் மற்றும் ஒவ்வொன்றுக்கும் ஒரு சுருக்கமான எடுத்துக்காட்டு கொடுக்கவும்.`,
      options: [],
      correctAnswer: `இரண்டு சரியான அடிப்படை கருத்துகளை தெளிவாகக் குறிப்பிட வேண்டும்; ஒவ்வொன்றுக்கும் பொருத்தமான எடுத்துக்காட்டு இருக்க வேண்டும்.`,
      explanation: `இந்த வினா கருத்து புரிதல் மற்றும் விளக்கத் திறனை மதிப்பிடுகிறது.`,
      difficulty: 'Medium',
      points: 10
    };
  }

  if (medium === 'Sinhala') {
    return {
      type: 'structured',
      title: `[Grade 6][Sinhala][Pack-323][STR ${index}] ${subject} භාවිතය`,
      body: `${subjectLabel} විෂයේ ඉගෙන ගන්නා මූලික සංකල්ප දෙකක් ලියන්න; සංකල්පයකට කෙටි උදාහරණයක්ද දෙන්න.`,
      options: [],
      correctAnswer: `නිවැරදි මූලික සංකල්ප දෙකක් පැහැදිලිව සඳහන් කර ඒවාට ගැලපෙන කෙටි උදාහරණ ලබා දිය යුතුය.`,
      explanation: `මෙම ප්‍රශ්නය සංකල්ප අවබෝධය සහ විස්තර කිරීමේ හැකියාව පරීක්ෂා කරයි.`,
      difficulty: 'Medium',
      points: 10
    };
  }

  return {
    type: 'structured',
    title: `[Grade 6][English][Pack-323][STR ${index}] ${subject} application`,
    body: `Write two key Grade 6 ideas from ${subjectLabel} and give one short example for each.`,
    options: [],
    correctAnswer: `A full answer names two correct core ideas and gives one suitable example for each idea.`,
    explanation: `This question checks concept understanding and explanation clarity.`,
    difficulty: 'Medium',
    points: 10
  };
};

const buildEssayQuestion = (subject, medium, index) => {
  const subjectLabel = getSubjectLabel(subject, medium);

  if (medium === 'Tamil') {
    return {
      type: 'essay',
      title: `[Grade 6][Tamil][Pack-323][ESSAY ${index}] ${subject} கட்டுரை`,
      body: `${subjectLabel} கற்றல் ஏன் முக்கியம் என்பதை பற்றி ஒரு குறுங்கட்டுரை எழுதவும். பள்ளி, வீடு மற்றும் நாளாந்த வாழ்க்கையில் அதன் பயனை எடுத்துக்கூறவும்.`,
      options: [],
      correctAnswer: `சரியான கட்டுரையில் பாடத்தின் முக்கியத்துவம், நடைமுறை பயன்பாடு மற்றும் மாணவர் கற்றல் நன்மைகள் இடம்பெற வேண்டும்.`,
      explanation: `கருத்துத் தரம், கட்டமைப்பு மற்றும் பொருத்தம் அடிப்படையில் மதிப்பிடப்படும்.`,
      difficulty: 'Hard',
      points: 15
    };
  }

  if (medium === 'Sinhala') {
    return {
      type: 'essay',
      title: `[Grade 6][Sinhala][Pack-323][ESSAY ${index}] ${subject} රචනය`,
      body: `${subjectLabel} ඉගෙනීම වැදගත් වන්නේ ඇයි යන්න පිළිබඳ කෙටි රචනයක් ලියන්න. පාසල්, නිවස සහ දෛනික ජීවිත උදාහරණ එක් කරන්න.`,
      options: [],
      correctAnswer: `හොඳ රචනයක විෂයේ වැදගත්කම, ප්‍රායෝගික භාවිතය සහ ඉගෙනුම් ප්‍රතිලාභ ඇතුළත් විය යුතුය.`,
      explanation: `මෙය අදහස් ගුණාත්මකභාවය, ව්‍යුහය සහ අදාළතාව අනුව ඇගයෙයි.`,
      difficulty: 'Hard',
      points: 15
    };
  }

  return {
    type: 'essay',
    title: `[Grade 6][English][Pack-323][ESSAY ${index}] ${subject} essay`,
    body: `Write a short essay on why learning ${subjectLabel} is important for Grade 6 students, using school and daily-life examples.`,
    options: [],
    correctAnswer: `A strong essay should include importance, practical relevance, and student learning benefits with examples.`,
    explanation: `Evaluation is based on idea quality, structure, and relevance.`,
    difficulty: 'Hard',
    points: 15
  };
};

const buildQuestionPack = (subject, medium) => {
  const mcq = [1, 2, 3].map((i) => buildMcqQuestion(subject, medium, i));
  const structured = [1, 2].map((i) => buildStructuredQuestion(subject, medium, i));
  const essay = [1, 2, 3].map((i) => buildEssayQuestion(subject, medium, i));
  return [...mcq, ...structured, ...essay];
};

async function getSeedAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) {
    author = await User.findOne({ role: 'tutor', isActive: true });
  }

  if (!author) {
    author = new User({
      username: 'grade6_pack_seed_admin',
      email: 'grade6.pack.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: {
        firstName: 'Grade6',
        lastName: 'PackSeeder'
      }
    });
    await author.save();
  }

  return author;
}

async function upsertQuestionWithAnswer(author, subject, medium, payload) {
  const tags = ['grade-6', `medium-${medium.toLowerCase()}`, 'seeded-pack-3-2-3-v1'];

  let question = await Question.findOne({
    grade,
    subject,
    title: payload.title
  });
  let createdQuestion = false;

  if (!question) {
    question = await Question.create({
      title: payload.title,
      body: payload.body,
      subject,
      grade,
      author: author._id,
      tags,
      type: payload.type,
      difficulty: payload.difficulty,
      points: payload.points,
      options: payload.options,
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation
    });
    createdQuestion = true;
  }

  const answerBody = `[Seeded ${medium} Pack-323] ${payload.correctAnswer}`;
  let answer = await Answer.findOne({ question: question._id, body: answerBody });
  let createdAnswer = false;

  if (!answer) {
    answer = await Answer.create({
      body: answerBody,
      question: question._id,
      author: author._id,
      isAccepted: true,
      status: 'correct',
      tutorComment: `Reference answer for ${medium} medium question pack.`
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

async function seedGrade6QuestionPack() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  const author = await getSeedAuthor();
  let questionsCreated = 0;
  let answersCreated = 0;

  for (const subject of subjects) {
    for (const medium of mediums) {
      const pack = buildQuestionPack(subject, medium);
      for (const payload of pack) {
        const { createdQuestion, createdAnswer } = await upsertQuestionWithAnswer(author, subject, medium, payload);
        if (createdQuestion) questionsCreated += 1;
        if (createdAnswer) answersCreated += 1;
      }
    }
  }

  console.log(`Grade 6 pack seeding complete. Questions created: ${questionsCreated}, answers created: ${answersCreated}`);
  await mongoose.connection.close();
}

seedGrade6QuestionPack().catch(async (error) => {
  console.error('Grade 6 pack seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
