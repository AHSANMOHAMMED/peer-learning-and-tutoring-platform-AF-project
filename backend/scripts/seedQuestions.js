const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const grade = 8;
const mediums = ['English', 'Tamil', 'Sinhala'];
const seedTag = 'g8-allsubj-3med-v1';

const questionSets = [
  {
    subject: 'Tamil',
    prefix: 'First Language Tamil',
    mcq: {
      body: '"அன்னை" என்ற சொல்லின் பொருள் என்ன?',
      options: ['நண்பர்', 'தாய்', 'அண்ணன்', 'சகோதரி'],
      correctAnswer: 'தாய்',
      explanation: '"அன்னை" என்பது "தாய்" என்பதை குறிக்கிறது.'
    },
    structured: {
      body: 'ஒரு பழமொழி எழுதவும் அதன் அர்த்தம் சொல்லவும்.',
      correctAnswer: 'எடுத்துக்காட்டு: "அறிவு செல்வம்". அர்த்தம்: அறிவு மனிதனின் மிகப் பெரிய செல்வம்.',
      explanation: 'பழமொழியை சரியாக எழுதி அதன் பொருளை தெளிவாக கூற வேண்டும்.'
    },
    essay: {
      body: '“என் பள்ளி வாழ்க்கை” பற்றி 150 வார்த்தைகளில் எழுதுக.',
      correctAnswer: 'நல்ல பதிலில் பள்ளி அனுபவங்கள், நண்பர்கள், ஆசிரியர்கள், கற்றல் மற்றும் ஒழுக்கம் பற்றி இணக்கமாக விளக்கம் இருக்க வேண்டும்.',
      explanation: 'கட்டுரையின் அமைப்பு, பொருத்தம் மற்றும் மொழிநடை அடிப்படையில் மதிப்பிடலாம்.'
    }
  },
  {
    subject: 'Sinhala',
    prefix: 'First Language Sinhala',
    mcq: {
      body: '"මව" යන වචනයේ අර්ථය කුමක්ද?',
      options: ['මිතුරා', 'අම්මා', 'අයියා', 'සහෝදරිය'],
      correctAnswer: 'අම්මා',
      explanation: '"මව" යනු "අම්මා" යන්නයි.'
    },
    structured: {
      body: 'එක් කියමනක් ලියා එහි අර්ථය සඳහන් කරන්න.',
      correctAnswer: 'උදාහරණයක් ලෙස නිවැරදි කියමනක් ලියා එහි අර්ථය පැහැදිලිව සඳහන් කළ යුතුය.',
      explanation: 'කියමන නිවැරදිව ලිවීම සහ අර්ථය පැහැදිලි කිරීම අවශ්යයි.'
    },
    essay: {
      body: '“මගේ පාසල් ජීවිතය” ගැන වචන 150 ක රචනයක් ලියන්න.',
      correctAnswer: 'හොඳ පිළිතුරක පාසල් අත්දැකීම්, ගුරුතුමන්ලා, මිතුරන් සහ ඉගෙනීමේ වැදගත්කම ඇතුළත් විය යුතුය.',
      explanation: 'රචනය අන්තර්ගතය, ව්යුහය සහ භාෂා භාවිතය අනුව ඇගයිය හැක.'
    }
  },
  {
    subject: 'English Language',
    prefix: 'English Language',
    mcq: {
      body: 'Choose the correct sentence:',
      options: ['She go to school', 'She goes to school', 'She going school', 'She gone school'],
      correctAnswer: 'She goes to school',
      explanation: 'For third person singular in present simple, use "goes".'
    },
    structured: {
      body: 'Write 5 sentences about your best friend.',
      correctAnswer: 'A complete answer should include five meaningful, grammatically correct sentences about a best friend.',
      explanation: 'Check sentence structure, grammar, and relevance.'
    },
    essay: {
      body: 'Write an essay on “My Favourite Teacher”.',
      correctAnswer: 'A strong essay should include who the teacher is, why the teacher is favourite, and examples of guidance and inspiration.',
      explanation: 'Evaluate organization, grammar, and clarity of ideas.'
    }
  },
  {
    subject: 'Mathematics',
    prefix: 'Mathematics',
    mcq: {
      body: 'What is 25 x 4?',
      options: ['50', '75', '100', '125'],
      correctAnswer: '100',
      explanation: '25 multiplied by 4 equals 100.'
    },
    structured: {
      body: 'Find the perimeter of a rectangle (Length = 10 cm, Width = 5 cm).',
      correctAnswer: 'Perimeter = 2 x (10 + 5) = 30 cm.',
      explanation: 'Use perimeter formula: 2 x (length + width).' 
    },
    essay: {
      body: 'Explain how to find the area of a triangle with an example.',
      correctAnswer: 'Area of a triangle = 1/2 x base x height. Example: base 10 cm, height 6 cm => area = 30 cm2.',
      explanation: 'A complete answer should include formula, substitution, and final unit.'
    }
  },
  {
    subject: 'Science',
    prefix: 'Science',
    mcq: {
      body: 'Which gas is essential for breathing?',
      options: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Hydrogen'],
      correctAnswer: 'Oxygen',
      explanation: 'Humans need oxygen for respiration.'
    },
    structured: {
      body: 'What is photosynthesis?',
      correctAnswer: 'Photosynthesis is the process by which green plants make food using sunlight, carbon dioxide, and water.',
      explanation: 'Key points are sunlight, chlorophyll, carbon dioxide, water, and food production.'
    },
    essay: {
      body: 'Explain the water cycle with a diagram.',
      correctAnswer: 'A full answer explains evaporation, condensation, precipitation, and collection, with a labeled diagram.',
      explanation: 'Evaluate scientific accuracy and completeness of stages.'
    }
  },
  {
    subject: 'History',
    prefix: 'History',
    mcq: {
      body: 'Who was the first king of Sri Lanka?',
      options: ['Dutugemunu', 'Vijaya', 'Parakramabahu', 'Elara'],
      correctAnswer: 'Vijaya',
      explanation: 'Prince Vijaya is traditionally recognized as the first king.'
    },
    structured: {
      body: 'Write two facts about King Dutugemunu.',
      correctAnswer: 'Two valid facts may include his role in unifying the country and his battle against King Elara.',
      explanation: 'Credit any two historically correct points.'
    },
    essay: {
      body: 'Describe the importance of ancient kingdoms in Sri Lanka.',
      correctAnswer: 'A good essay should mention governance, irrigation systems, culture, religion, and heritage preservation.',
      explanation: 'Assess historical relevance and structured explanation.'
    }
  },
  {
    subject: 'Islam',
    prefix: 'Religion',
    mcq: {
      body: 'What is the holy book of Islam?',
      options: ['Bible', 'Tripitaka', 'Quran', 'Vedas'],
      correctAnswer: 'Quran',
      explanation: 'The Quran is the holy book of Islam.'
    },
    structured: {
      body: 'Write one teaching from your religion.',
      correctAnswer: 'Any valid teaching such as honesty, kindness, compassion, prayer, or respect for others can be accepted with explanation.',
      explanation: 'Accept religion-appropriate moral teachings with clear meaning.'
    },
    essay: {
      body: 'Explain the importance of religious values in daily life.',
      correctAnswer: 'A good essay should explain how religious values guide behavior, discipline, respect, and harmony in society.',
      explanation: 'Evaluate moral understanding, examples, and coherence.'
    }
  },
  {
    subject: 'Geography',
    prefix: 'Geography',
    mcq: {
      body: 'What is the capital of Sri Lanka?',
      options: ['Kandy', 'Colombo', 'Sri Jayawardenepura Kotte', 'Galle'],
      correctAnswer: 'Sri Jayawardenepura Kotte',
      explanation: 'Sri Jayawardenepura Kotte is the administrative capital of Sri Lanka.'
    },
    structured: {
      body: 'Name two natural resources in Sri Lanka.',
      correctAnswer: 'Examples include water resources, forests, minerals, and fertile soil.',
      explanation: 'Any two valid natural resources are acceptable.'
    },
    essay: {
      body: 'Explain the climate of Sri Lanka.',
      correctAnswer: 'A complete answer should include tropical climate, monsoon patterns, rainfall variation, and temperature trends.',
      explanation: 'Assess understanding of regional climate and factors.'
    }
  },
  {
    subject: 'Life Competencies and Citizenship Education',
    prefix: 'Civic Education / Life Competencies',
    mcq: {
      body: 'What is a responsibility of a good citizen?',
      options: ['Breaking rules', 'Respecting laws', 'Ignoring others', 'Fighting'],
      correctAnswer: 'Respecting laws',
      explanation: 'A good citizen respects laws and social rules.'
    },
    structured: {
      body: 'What is teamwork?',
      correctAnswer: 'Teamwork means working together cooperatively to achieve a common goal.',
      explanation: 'Key ideas are cooperation, shared responsibility, and common goals.'
    },
    essay: {
      body: 'Explain the importance of discipline in life.',
      correctAnswer: 'A strong answer should discuss self-control, time management, responsibility, and success in education and life.',
      explanation: 'Evaluate practical examples and value-based understanding.'
    }
  },
  {
    subject: 'ICT',
    prefix: 'ICT',
    mcq: {
      body: 'What does CPU stand for?',
      options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Control Processing Unit'],
      correctAnswer: 'Central Processing Unit',
      explanation: 'CPU stands for Central Processing Unit.'
    },
    structured: {
      body: 'Name two input devices.',
      correctAnswer: 'Examples: keyboard, mouse, scanner, microphone, webcam.',
      explanation: 'Any two correct input devices are acceptable.'
    },
    essay: {
      body: 'Explain the uses of computers in education.',
      correctAnswer: 'A good answer should include online learning, research, presentations, assessments, and communication.',
      explanation: 'Evaluate breadth of educational applications and clarity.'
    }
  },
  {
    subject: 'Health & Physical Education',
    prefix: 'Health and Physical Education',
    mcq: {
      body: 'Which is a healthy habit?',
      options: ['Eating junk food', 'Sleeping late', 'Exercising regularly', 'Skipping meals'],
      correctAnswer: 'Exercising regularly',
      explanation: 'Regular exercise improves health and fitness.'
    },
    structured: {
      body: 'What is balanced diet?',
      correctAnswer: 'A balanced diet includes the right amounts of carbohydrates, proteins, fats, vitamins, minerals, fiber, and water.',
      explanation: 'A complete answer should mention nutrient balance and health benefits.'
    },
    essay: {
      body: 'Explain the importance of physical exercise.',
      correctAnswer: 'A good essay should discuss fitness, disease prevention, mental health, and active lifestyle benefits.',
      explanation: 'Assess real-life relevance and completeness.'
    }
  },
  {
    subject: 'Art',
    prefix: 'Art',
    mcq: {
      body: 'Which color is made by mixing red and blue?',
      options: ['Green', 'Purple', 'Orange', 'Yellow'],
      correctAnswer: 'Purple',
      explanation: 'Red + blue makes purple.'
    },
    structured: {
      body: 'What is primary color?',
      correctAnswer: 'Primary colors are basic colors that cannot be made by mixing other colors (red, blue, yellow).',
      explanation: 'Include the concept and examples of primary colors.'
    },
    essay: {
      body: 'Describe your favorite drawing.',
      correctAnswer: 'A strong answer should describe the drawing theme, colors, techniques, and why it is meaningful.',
      explanation: 'Evaluate creativity and descriptive expression.'
    }
  },
  {
    subject: 'Dancing',
    prefix: 'Dancing',
    mcq: {
      body: 'Bharatanatyam is a form of:',
      options: ['Western dance', 'Classical dance', 'Hip-hop', 'Folk dance'],
      correctAnswer: 'Classical dance',
      explanation: 'Bharatanatyam is an Indian classical dance form.'
    },
    structured: {
      body: 'Name one Sri Lankan traditional dance.',
      correctAnswer: 'Examples: Kandyan dance, Low Country dance, or Sabaragamuwa dance.',
      explanation: 'Any one recognized Sri Lankan traditional dance is correct.'
    },
    essay: {
      body: 'Explain the importance of dance in culture.',
      correctAnswer: 'A complete answer should discuss heritage, storytelling, rituals, identity, and artistic expression.',
      explanation: 'Assess cultural understanding and examples.'
    }
  },
  {
    subject: 'Music',
    prefix: 'Music',
    mcq: {
      body: 'Which is a musical instrument?',
      options: ['Book', 'Guitar', 'Chair', 'Table'],
      correctAnswer: 'Guitar',
      explanation: 'Guitar is a musical instrument.'
    },
    structured: {
      body: 'What is rhythm?',
      correctAnswer: 'Rhythm is the pattern of beats and timing in music.',
      explanation: 'A complete answer should mention beat pattern and timing.'
    },
    essay: {
      body: 'Explain the role of music in life.',
      correctAnswer: 'A good answer may include emotional expression, relaxation, culture, communication, and entertainment.',
      explanation: 'Evaluate clarity, relevance, and examples.'
    }
  },
  {
    subject: 'Drama & Theatre',
    prefix: 'Drama and Theatre',
    mcq: {
      body: '"Drama" mainly involves:',
      options: ['Acting', 'Cooking', 'Painting', 'Writing'],
      correctAnswer: 'Acting',
      explanation: 'Drama mainly involves acting and performance.'
    },
    structured: {
      body: 'What is a stage?',
      correctAnswer: 'A stage is the area where performers act in front of an audience.',
      explanation: 'The answer should identify the stage as the performance space.'
    },
    essay: {
      body: 'Explain how drama helps in communication skills.',
      correctAnswer: 'A good answer should explain confidence building, voice control, body language, listening, and teamwork.',
      explanation: 'Assess practical communication benefits and examples.'
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

const tamilSubjectName = {
  Tamil: 'தமிழ்',
  Sinhala: 'சிங்களம்',
  'English Language': 'ஆங்கில மொழி',
  Mathematics: 'கணிதம்',
  Science: 'அறிவியல்',
  History: 'வரலாறு',
  Islam: 'இஸ்லாம் மதம்',
  Geography: 'புவியியல்',
  'Life Competencies and Citizenship Education': 'வாழ்க்கைத் திறன்கள் மற்றும் குடியுரிமைக் கல்வி',
  ICT: 'தகவல் தொடர்பாடல் தொழில்நுட்பம்',
  'Health & Physical Education': 'சுகாதாரம் மற்றும் உடற்கல்வி',
  Art: 'ஓவியம்',
  Dancing: 'நடனம்',
  Music: 'இசை',
  'Drama & Theatre': 'நாடகம் மற்றும் அரங்கக்கலை'
};

const sinhalaSubjectName = {
  Tamil: 'දෙමළ',
  Sinhala: 'සිංහල',
  'English Language': 'ඉංග්රීසි භාෂාව',
  Mathematics: 'ගණිතය',
  Science: 'විද්යාව',
  History: 'ඉතිහාසය',
  Islam: 'ඉස්ලාම් ආගම',
  Geography: 'භූගෝල විද්යාව',
  'Life Competencies and Citizenship Education': 'ජීවන කුසලතා සහ පුරවැසි අධ්යාපනය',
  ICT: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය',
  'Health & Physical Education': 'සෞඛ්ය සහ ශාරීරික අධ්යාපනය',
  Art: 'කලා',
  Dancing: 'නර්තනය',
  Music: 'සංගීතය',
  'Drama & Theatre': 'නාට්ය හා රංග කලාව'
};

function getLocalizedSubjectName(subject, medium) {
  if (medium === 'Tamil') return tamilSubjectName[subject] || subject;
  if (medium === 'Sinhala') return sinhalaSubjectName[subject] || subject;
  return subject;
}

function getLocalizedTemplate(set, medium, type) {
  if (medium === 'English') {
    return set[type];
  }

  const subjectLabel = getLocalizedSubjectName(set.subject, medium);

  if (medium === 'Tamil') {
    if (type === 'mcq') {
      return {
        body: `${subjectLabel} பாடத்திற்கான சரியான விடையைத் தேர்ந்தெடுக்கவும்.`,
        options: ['விருப்பம் 1', 'விருப்பம் 2', 'விருப்பம் 3', 'விருப்பம் 4'],
        correctAnswer: 'விருப்பம் 1',
        explanation: `${subjectLabel} பாடத்தின் அடிப்படை கருத்தை அடிப்படையாகக் கொண்ட பல்தேர்வு வினா.`
      };
    }

    if (type === 'structured') {
      return {
        body: `${subjectLabel} பாடத்தில் உள்ள ஒரு முக்கிய கருத்தை உங்கள் சொற்களில் விளக்கவும்.`,
        correctAnswer: `சரியான பதில் ${subjectLabel} பாடத்தின் முக்கிய கருத்தை தெளிவாகவும் தொடர்புடைய எடுத்துக்காட்டுடன் விளக்க வேண்டும்.`,
        explanation: 'கருத்து தெளிவு, பொருத்தம் மற்றும் மொழித் துல்லியம் அடிப்படையில் மதிப்பிடவும்.'
      };
    }

    return {
      body: `${subjectLabel} பாடத்தின் முக்கியத்துவத்தை விளக்கும் சிறு கட்டுரை எழுதுக.`,
      correctAnswer: `நல்ல கட்டுரை ${subjectLabel} பாடத்தின் பயன்பாடு, வாழ்க்கைத் தொடர்பு மற்றும் கற்றலின் மதிப்பை உள்ளடக்க வேண்டும்.`,
      explanation: 'அமைப்பு, உள்ளடக்கத்தின் தொடர்பு மற்றும் மொழிநடை அடிப்படையில் மதிப்பிடவும்.'
    };
  }

  if (type === 'mcq') {
    return {
      body: `${subjectLabel} විෂයට අදාළ නිවැරදි පිළිතුර තෝරන්න.`,
      options: ['විකල්පය 1', 'විකල්පය 2', 'විකල්පය 3', 'විකල්පය 4'],
      correctAnswer: 'විකල්පය 1',
      explanation: `${subjectLabel} විෂයේ මූලික සංකල්පය මත පදනම් වූ බහුවරණ ප්රශ්නයකි.`
    };
  }

  if (type === 'structured') {
    return {
      body: `${subjectLabel} විෂයේ එක් ප්රධාන සංකල්පයක් ඔබේ වචනවලින් පැහැදිලි කරන්න.`,
      correctAnswer: `නිවැරදි පිළිතුරේ ${subjectLabel} විෂයේ සංකල්පය පැහැදිලිව සහ උදාහරණයක් සමඟ දක්විය යුතුය.`,
      explanation: 'සංකල්ප පැහැදිලි බව, අදාළත්වය සහ භාෂා නිවැරදිභාවය අනුව ඇගයීම කළ යුතුය.'
    };
  }

  return {
    body: `${subjectLabel} විෂයේ වැදගත්කම පැහැදිලි කරමින් කෙටි රචනයක් ලියන්න.`,
    correctAnswer: `හොඳ රචනයක ${subjectLabel} විෂයේ භාවිතය, දෛනික ජීවිතයට ඇති සම්බන්ධය සහ ඉගෙනීමේ වටිනාකම ඇතුළත් විය යුතුය.`,
    explanation: 'ව්යුහය, අන්තර්ගතය සහ අදහස් පැහැදිලිව ඉදිරිපත් කිරීම අනුව ඇගයීම කළ යුතුය.'
  };
}

async function createDefaultUsers() {
  const rolesMap = {
    'websiteAdmin': 'admin@aura.lk',
    'tutor': 'tutor@aura.lk',
    'student': 'student@aura.lk',
    'parent': 'parent@aura.lk'
  };

  for (const [role, email] of Object.entries(rolesMap)) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: `${role}_demo`,
        email,
        password: 'Aura@12345', // Will be hashed by model pre-save
        role,
        isActive: true,
        isVerified: true,
        profile: {
          firstName: role.charAt(0).toUpperCase() + role.slice(1),
          lastName: 'User'
        }
      });
      console.log(`Created ${role} user: ${email} / Aura@12345`);
    }
  }
}

async function seedGrade8AllSubjects3Mediums() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  await createDefaultUsers();
  
  const adminAuthor = await User.findOne({ role: 'websiteAdmin' });
  let questionsCreated = 0;
  let answersCreated = 0;

  for (const set of questionSets) {
    for (const medium of mediums) {
      const types = ['mcq', 'structured', 'essay'];
      for (const type of types) {
        const template = getLocalizedTemplate(set, medium, type);
        const title = `[Grade 8][${medium}][${set.prefix}][${type.toUpperCase()}][${seedTag}]`;
        
        let question = await Question.findOne({ title });
        if (!question) {
          question = await Question.create({
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
            author: adminAuthor._id,
            tags: ['grade-8', seedTag, `medium-${medium.toLowerCase()}`]
          });
          questionsCreated += 1;
        }

        const answerBody = `[Seeded ${seedTag}][${medium}] ${template.correctAnswer}`;
        let answer = await Answer.findOne({ question: question._id, body: answerBody });
        if (!answer) {
          await Answer.create({
            body: answerBody,
            question: question._id,
            author: adminAuthor._id,
            isAccepted: true,
            status: 'correct'
          });
          answersCreated += 1;
        }

        if (!question.hasAcceptedAnswer) {
          question.hasAcceptedAnswer = true;
          question.answerCount = 1;
          await question.save();
        }
      }
    }
  }

  console.log(`Seeding complete. Questions: ${questionsCreated}, Answers: ${answersCreated}`);
  process.exit(0);
}

seedGrade8AllSubjects3Mediums().catch(err => {
  console.error(err);
  process.exit(1);
});
