require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const seedTag = 'g8-allsubj-3med-v1';

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
  'English Language': 'ඉංග්‍රීසි භාෂාව',
  Mathematics: 'ගණිතය',
  Science: 'විද්‍යාව',
  History: 'ඉතිහාසය',
  Islam: 'ඉස්ලාම් ආගම',
  Geography: 'භූගෝල විද්‍යාව',
  'Life Competencies and Citizenship Education': 'ජීවන කුසලතා සහ පුරවැසි අධ්‍යාපනය',
  ICT: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය',
  'Health & Physical Education': 'සෞඛ්‍ය සහ ශාරීරික අධ්‍යාපනය',
  Art: 'කලා',
  Dancing: 'නර්තනය',
  Music: 'සංගීතය',
  'Drama & Theatre': 'නාට්‍ය හා රංග කලාව'
};

function getLocalizedSubjectName(subject, medium) {
  if (medium === 'Tamil') return tamilSubjectName[subject] || subject;
  if (medium === 'Sinhala') return sinhalaSubjectName[subject] || subject;
  return subject;
}

function buildLocalizedQuestionContent(subject, medium, type) {
  const subjectLabel = getLocalizedSubjectName(subject, medium);

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
        options: [],
        correctAnswer: `சரியான பதில் ${subjectLabel} பாடத்தின் முக்கிய கருத்தை தெளிவாகவும் தொடர்புடைய எடுத்துக்காட்டுடன் விளக்க வேண்டும்.`,
        explanation: 'கருத்து தெளிவு, பொருத்தம் மற்றும் மொழித் துல்லியம் அடிப்படையில் மதிப்பிடவும்.'
      };
    }

    return {
      body: `${subjectLabel} பாடத்தின் முக்கியத்துவத்தை விளக்கும் சிறு கட்டுரை எழுதுக.`,
      options: [],
      correctAnswer: `நல்ல கட்டுரை ${subjectLabel} பாடத்தின் பயன்பாடு, வாழ்க்கைத் தொடர்பு மற்றும் கற்றலின் மதிப்பை உள்ளடக்க வேண்டும்.`,
      explanation: 'அமைப்பு, உள்ளடக்கத்தின் தொடர்பு மற்றும் மொழிநடை அடிப்படையில் மதிப்பிடவும்.'
    };
  }

  if (type === 'mcq') {
    return {
      body: `${subjectLabel} විෂයට අදාළ නිවැරදි පිළිතුර තෝරන්න.`,
      options: ['විකල්පය 1', 'විකල්පය 2', 'විකල්පය 3', 'විකල්පය 4'],
      correctAnswer: 'විකල්පය 1',
      explanation: `${subjectLabel} විෂයේ මූලික සංකල්පය මත පදනම් වූ බහුවරණ ප්‍රශ්නයකි.`
    };
  }

  if (type === 'structured') {
    return {
      body: `${subjectLabel} විෂයේ එක් ප්‍රධාන සංකල්පයක් ඔබේ වචනවලින් පැහැදිලි කරන්න.`,
      options: [],
      correctAnswer: `නිවැරදි පිළිතුරේ ${subjectLabel} විෂයේ සංකල්පය පැහැදිලිව සහ උදාහරණයක් සමඟ දක්විය යුතුය.`,
      explanation: 'සංකල්ප පැහැදිලි බව, අදාළත්වය සහ භාෂා නිවැරදිභාවය අනුව ඇගයීම කළ යුතුය.'
    };
  }

  return {
    body: `${subjectLabel} විෂයේ වැදගත්කම පැහැදිලි කරමින් කෙටි රචනයක් ලියන්න.`,
    options: [],
    correctAnswer: `හොඳ රචනයක ${subjectLabel} විෂයේ භාවිතය, දෛනික ජීවිතයට ඇති සම්බන්ධය සහ ඉගෙනීමේ වටිනාකම ඇතුළත් විය යුතුය.`,
    explanation: 'ව්‍යුහය, අන්තර්ගතය සහ අදහස් පැහැදිලිව ඉදිරිපත් කිරීම අනුව ඇගයීම කළ යුතුය.'
  };
}

async function fixGrade8MediumLanguageV1() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  const query = {
    grade: 8,
    tags: seedTag,
    $or: [
      { tags: 'medium-tamil' },
      { tags: 'medium-sinhala' }
    ]
  };

  const questions = await Question.find(query).select('_id title subject type tags');

  let questionsUpdated = 0;
  let answersUpdated = 0;

  for (const question of questions) {
    const medium = question.tags.includes('medium-tamil') ? 'Tamil' : 'Sinhala';
    const content = buildLocalizedQuestionContent(question.subject, medium, question.type);

    const updatePayload = {
      body: content.body,
      correctAnswer: content.correctAnswer,
      explanation: content.explanation
    };

    if (question.type === 'mcq') {
      updatePayload.options = content.options;
    } else {
      updatePayload.options = [];
    }

    const updateResult = await Question.updateOne({ _id: question._id }, { $set: updatePayload });
    if (updateResult.modifiedCount > 0) {
      questionsUpdated += 1;
    }

    const answerBody = `[Seeded ${seedTag}][${medium}] ${content.correctAnswer}`;
    const answerResult = await Answer.updateMany(
      { question: question._id },
      {
        $set: {
          body: answerBody,
          tutorComment: medium === 'Tamil'
            ? `${question.subject} (தமிழ் மூலம்) கேள்விக்கான குறிப்புப் பதில்.`
            : `${question.subject} (සිංහල මාධ්‍ය) ප්‍රශ්නය සඳහා යොමු පිළිතුර.`
        }
      }
    );

    answersUpdated += answerResult.modifiedCount;
  }

  console.log(`Grade 8 medium language fix complete. Questions updated: ${questionsUpdated}, answers updated: ${answersUpdated}`);
  await mongoose.connection.close();
}

fixGrade8MediumLanguageV1().catch(async (error) => {
  console.error('Grade 8 medium language fix failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
