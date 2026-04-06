require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const grade = 9;
const mediums = ['English', 'Tamil', 'Sinhala'];
const seedTag = 'g9-allsubj-3med-v1';

const questionSets = [
  {
    subject: 'Tamil',
    prefix: 'First Language Tamil',
    mcq: {
      body: '"மரம்" என்ற சொல்லின் பொருள் என்ன?',
      options: ['பறவை', 'செடி', 'மரம்', 'பூ'],
      correctAnswer: 'மரம்',
      explanation: '"மரம்" என்ற சொல்லின் பொருள் மரம் ஆகும்.'
    },
    structured: {
      body: 'ஒரு வாக்கியம் எழுதுக.',
      correctAnswer: 'எடுத்துக்காட்டு: நான் தினமும் பள்ளிக்கு செல்கிறேன்.',
      explanation: 'ஒரு சரியான, அர்த்தமுள்ள வாக்கியம் எழுத வேண்டும்.'
    },
    essay: {
      body: '“என் நண்பன்” பற்றி எழுதுக.',
      correctAnswer: 'நல்ல பதிலில் நண்பனின் குணங்கள், உதவி மனப்பான்மை, மற்றும் நினைவுகள் போன்றவை இடம்பெற வேண்டும்.',
      explanation: 'கட்டுரையின் தெளிவு, பொருத்தம் மற்றும் மொழிநடை அடிப்படையில் மதிப்பிடலாம்.'
    }
  },
  {
    subject: 'Sinhala',
    prefix: 'First Language Sinhala',
    mcq: {
      body: '"ගස" යන වචනයේ අර්ථය කුමක්ද?',
      options: ['කුරුල්ලෙක්', 'පැල', 'ගස', 'මල'],
      correctAnswer: 'ගස',
      explanation: '"ගස" යන වචනයේ අර්ථය ගසයි.'
    },
    structured: {
      body: 'එක් වාක්‍යයක් ලියන්න.',
      correctAnswer: 'උදාහරණයක්: මම දිනපතා පාසලට යමි.',
      explanation: 'නිවැරදි සහ අර්ථවත් වාක්‍යයක් ලියන්න.'
    },
    essay: {
      body: '“මගේ මිතුරා” ගැන ලියන්න.',
      correctAnswer: 'හොඳ පිළිතුරක මිතුරාගේ ගුණාංග, උපකාරක ස්වභාවය සහ මතකයන් සඳහන් විය යුතුය.',
      explanation: 'අන්තර්ගතය, ව්‍යුහය සහ භාෂා භාවිතය අනුව ඇගයිය හැක.'
    }
  },
  {
    subject: 'English Language',
    prefix: 'English Language',
    mcq: {
      body: 'Choose the correct word: I ___ a student.',
      options: ['is', 'am', 'are', 'be'],
      correctAnswer: 'am',
      explanation: 'With subject "I", the correct verb is "am".'
    },
    structured: {
      body: 'Write 3 sentences about your school.',
      correctAnswer: 'A complete answer should include three meaningful and grammatically correct sentences about school.',
      explanation: 'Evaluate grammar, sentence structure, and relevance.'
    },
    essay: {
      body: 'Write about “My Best Friend”.',
      correctAnswer: 'A good answer should describe who the friend is, good qualities, and shared experiences.',
      explanation: 'Assess clarity, grammar, and idea flow.'
    }
  },
  {
    subject: 'Mathematics',
    prefix: 'Mathematics',
    mcq: {
      body: 'What is 10 + 5?',
      options: ['12', '13', '15', '20'],
      correctAnswer: '15',
      explanation: '10 + 5 = 15.'
    },
    structured: {
      body: 'What is 20 ÷ 4?',
      correctAnswer: '20 ÷ 4 = 5.',
      explanation: 'Division gives 5.'
    },
    essay: {
      body: 'Explain addition with an example.',
      correctAnswer: 'Addition means combining numbers. Example: 7 + 3 = 10.',
      explanation: 'A full answer should define addition and show one correct example.'
    }
  },
  {
    subject: 'Science',
    prefix: 'Science',
    mcq: {
      body: 'Which part of the plant makes food?',
      options: ['Root', 'Stem', 'Leaf', 'Flower'],
      correctAnswer: 'Leaf',
      explanation: 'Leaves make food by photosynthesis.'
    },
    structured: {
      body: 'Name two animals.',
      correctAnswer: 'Examples: dog and cat (any two correct animals).',
      explanation: 'Any two valid animal names are acceptable.'
    },
    essay: {
      body: 'Write about plants and their importance.',
      correctAnswer: 'A complete answer should include oxygen production, food, medicine, shade, and environmental value.',
      explanation: 'Assess understanding and use of simple examples.'
    }
  },
  {
    subject: 'History',
    prefix: 'History',
    mcq: {
      body: 'Who came first to Sri Lanka according to history?',
      options: ['Dutugemunu', 'Vijaya', 'Elara', 'Parakramabahu'],
      correctAnswer: 'Vijaya',
      explanation: 'Prince Vijaya is traditionally identified as first arrival in Sri Lankan history lessons.'
    },
    structured: {
      body: 'Name one ancient king of Sri Lanka.',
      correctAnswer: 'Examples include Vijaya, Dutugemunu, or Parakramabahu.',
      explanation: 'Any one valid ancient king name is acceptable.'
    },
    essay: {
      body: 'Write about early settlements in Sri Lanka.',
      correctAnswer: 'A good answer should mention early communities, agriculture, irrigation, and development of kingdoms.',
      explanation: 'Evaluate historical relevance and structured writing.'
    }
  },
  {
    subject: 'Buddhism',
    prefix: 'Religion',
    mcq: {
      body: 'Which is a place of worship for Buddhists?',
      options: ['Temple', 'Church', 'Mosque', 'Vihara'],
      correctAnswer: 'Vihara',
      explanation: 'A Vihara is a Buddhist place of worship.'
    },
    structured: {
      body: 'Name one religious festival.',
      correctAnswer: 'Examples: Vesak, Poson, Deepavali, Ramadan, Christmas (any one valid festival).',
      explanation: 'Any one recognized religious festival is acceptable.'
    },
    essay: {
      body: 'Write about the importance of kindness.',
      correctAnswer: 'A good answer should explain helping others, compassion, respect, and peace in daily life.',
      explanation: 'Assess values, examples, and clarity.'
    }
  },
  {
    subject: 'Geography',
    prefix: 'Geography',
    mcq: {
      body: 'Sri Lanka is a:',
      options: ['Continent', 'Island', 'Desert', 'Mountain'],
      correctAnswer: 'Island',
      explanation: 'Sri Lanka is an island nation.'
    },
    structured: {
      body: 'Name one river in Sri Lanka.',
      correctAnswer: 'Examples: Mahaweli River, Kelani River, Kalu River.',
      explanation: 'Any one correct Sri Lankan river is acceptable.'
    },
    essay: {
      body: 'Describe your village or town.',
      correctAnswer: 'A complete answer should describe location, environment, people, and important places in the village or town.',
      explanation: 'Evaluate descriptive quality and relevance.'
    }
  },
  {
    subject: 'Life Competencies and Citizenship Education',
    prefix: 'Civic Education / Life Competencies',
    mcq: {
      body: 'What should we do to help others?',
      options: ['Ignore', 'Help them', 'Fight', 'Laugh'],
      correctAnswer: 'Help them',
      explanation: 'Helping others is a positive and responsible action.'
    },
    structured: {
      body: 'What is sharing?',
      correctAnswer: 'Sharing means giving a part of what we have to others and using things together kindly.',
      explanation: 'Key idea is cooperation and kindness.'
    },
    essay: {
      body: 'Write about being a good student.',
      correctAnswer: 'A good student is disciplined, respectful, hardworking, and helpful to teachers and friends.',
      explanation: 'Assess attitude, values, and practical examples.'
    }
  },
  {
    subject: 'ICT',
    prefix: 'ICT',
    mcq: {
      body: 'Which device is used to type?',
      options: ['Mouse', 'Keyboard', 'Monitor', 'Printer'],
      correctAnswer: 'Keyboard',
      explanation: 'A keyboard is used to type text and numbers.'
    },
    structured: {
      body: 'Name one output device.',
      correctAnswer: 'Examples: monitor, printer, speaker, projector.',
      explanation: 'Any one valid output device is acceptable.'
    },
    essay: {
      body: 'Write about uses of computers.',
      correctAnswer: 'A complete answer may include learning, typing, drawing, communication, and finding information.',
      explanation: 'Evaluate clarity and range of uses.'
    }
  },
  {
    subject: 'Health & Physical Education',
    prefix: 'Health and Physical Education',
    mcq: {
      body: 'Which food is healthy?',
      options: ['Chips', 'Vegetables', 'Chocolate', 'Soda'],
      correctAnswer: 'Vegetables',
      explanation: 'Vegetables provide vitamins and minerals needed for health.'
    },
    structured: {
      body: 'Why should we drink water?',
      correctAnswer: 'Water is needed for hydration, digestion, temperature control, and overall body function.',
      explanation: 'A good answer should mention at least one health reason.'
    },
    essay: {
      body: 'Write about good habits.',
      correctAnswer: 'A good answer should include hygiene, healthy food, exercise, sleep, and respect for others.',
      explanation: 'Assess practical daily habits and explanation quality.'
    }
  },
  {
    subject: 'Art',
    prefix: 'Art',
    mcq: {
      body: 'Which color is the sun?',
      options: ['Blue', 'Yellow', 'Green', 'Black'],
      correctAnswer: 'Yellow',
      explanation: 'In basic art contexts, the sun is commonly represented with yellow color.'
    },
    structured: {
      body: 'Name one color.',
      correctAnswer: 'Examples: red, blue, yellow, green (any one color).',
      explanation: 'Any one valid color name is acceptable.'
    },
    essay: {
      body: 'Draw and describe your favorite picture.',
      correctAnswer: 'A complete answer should describe the drawing topic, colors used, and why it is favorite.',
      explanation: 'Evaluate creativity and descriptive expression.'
    }
  },
  {
    subject: 'Dancing',
    prefix: 'Dancing',
    mcq: {
      body: 'Dance is a form of:',
      options: ['Sport', 'Art', 'Study', 'Game'],
      correctAnswer: 'Art',
      explanation: 'Dance is a performing art form.'
    },
    structured: {
      body: 'Name one dance.',
      correctAnswer: 'Examples: Kandyan, Bharatanatyam, folk dance (any one valid dance).',
      explanation: 'Any one recognized dance form is acceptable.'
    },
    essay: {
      body: 'Write about why you like dancing.',
      correctAnswer: 'A good answer should explain enjoyment, health benefits, expression, and culture.',
      explanation: 'Assess personal expression and relevance.'
    }
  },
  {
    subject: 'Music',
    prefix: 'Music',
    mcq: {
      body: 'Which is used in music?',
      options: ['Guitar', 'Book', 'Chair', 'Pen'],
      correctAnswer: 'Guitar',
      explanation: 'A guitar is a musical instrument used in music.'
    },
    structured: {
      body: 'What is singing?',
      correctAnswer: 'Singing is producing musical sounds with the voice.',
      explanation: 'The answer should define singing as voice-based musical expression.'
    },
    essay: {
      body: 'Write about your favorite song.',
      correctAnswer: 'A complete answer should include song name, why it is favorite, and how it makes you feel.',
      explanation: 'Evaluate clarity and personal connection.'
    }
  },
  {
    subject: 'Drama & Theatre',
    prefix: 'Drama and Theatre',
    mcq: {
      body: 'Drama means:',
      options: ['Acting', 'Cooking', 'Drawing', 'Writing'],
      correctAnswer: 'Acting',
      explanation: 'Drama is mainly related to acting and performance.'
    },
    structured: {
      body: 'What is a play?',
      correctAnswer: 'A play is a story performed by actors on stage.',
      explanation: 'A play is designed for performance in theatre or drama.'
    },
    essay: {
      body: 'Write about acting.',
      correctAnswer: 'A good answer should explain expression, communication, confidence, and character portrayal in acting.',
      explanation: 'Assess understanding and examples.'
    }
  }
];

const difficultyByType = {
  mcq: 'Easy',
  structured: 'Medium',
  essay: 'Hard'
};

const pointsByType = {
  mcq: 5,
  structured: 10,
  essay: 15
};

async function getSeedAuthor() {
  let author = await User.findOne({ role: 'admin', isActive: true });
  if (!author) {
    author = await User.findOne({ role: 'tutor', isActive: true });
  }

  if (!author) {
    author = await User.create({
      username: 'grade9_all_subjects_seed_admin',
      email: 'grade9.all.subjects.seed.admin@peerlearn.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      profile: {
        firstName: 'Grade9',
        lastName: 'AllSubjectsSeeder'
      }
    });
  }

  return author;
}

function buildQuestionPayload(set, medium, type) {
  const template = set[type];
  const title = `[Grade 6][${medium}][${set.prefix}][${type.toUpperCase()}][${seedTag}]`;

  return {
    title,
    body: template.body,
    subject: set.subject,
    grade,
    type,
    difficulty: difficultyByType[type],
    points: pointsByType[type],
    options: type === 'mcq' ? template.options : [],
    correctAnswer: template.correctAnswer,
    explanation: template.explanation,
    tags: ['grade-6', seedTag, `medium-${medium.toLowerCase()}`]
  };
}

async function upsertQuestionAndAnswer(author, payload, medium) {
  let question = await Question.findOne({
    grade: payload.grade,
    subject: payload.subject,
    title: payload.title
  });

  let createdQuestion = false;
  if (!question) {
    question = await Question.create({
      title: payload.title,
      body: payload.body,
      subject: payload.subject,
      grade: payload.grade,
      author: author._id,
      type: payload.type,
      difficulty: payload.difficulty,
      points: payload.points,
      options: payload.options,
      correctAnswer: payload.correctAnswer,
      explanation: payload.explanation,
      tags: payload.tags
    });
    createdQuestion = true;
  }

  const answerBody = `[Seeded ${seedTag}][${medium}] ${payload.correctAnswer}`;
  let answer = await Answer.findOne({ question: question._id, body: answerBody });
  let createdAnswer = false;

  if (!answer) {
    answer = await Answer.create({
      body: answerBody,
      question: question._id,
      author: author._id,
      isAccepted: true,
      status: 'correct',
      tutorComment: `Reference answer for ${medium} medium ${payload.subject} ${payload.type} question.`
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

async function seedGrade9AllSubjects3MediumsV1() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  const author = await getSeedAuthor();
  let questionsCreated = 0;
  let answersCreated = 0;

  for (const set of questionSets) {
    for (const medium of mediums) {
      const types = ['mcq', 'structured', 'essay'];
      for (const type of types) {
        const payload = buildQuestionPayload(set, medium, type);
        const { createdQuestion, createdAnswer } = await upsertQuestionAndAnswer(author, payload, medium);
        if (createdQuestion) questionsCreated += 1;
        if (createdAnswer) answersCreated += 1;
      }
    }
  }

  console.log(`Grade 9 all-subjects v1 seeding complete. Questions created: ${questionsCreated}, answers created: ${answersCreated}`);
  await mongoose.connection.close();
}

seedGrade9AllSubjects3MediumsV1().catch(async (error) => {
  console.error('Grade 9 all-subjects v1 seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
