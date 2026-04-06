require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const updates = [
  {
    title: '[G8-CURATED] Parts of speech',
    set: {
      body: 'In the sentence "The quick fox jumped over the wall.", which word is the adjective?',
      options: ['fox', 'jumped', 'quick', 'wall'],
      correctAnswer: 'quick',
      explanation: 'An adjective describes a noun. Here, "quick" describes "fox".'
    }
  },
  {
    title: '[G8-CURATED] Latitude and climate',
    set: {
      body: 'Places near the equator are usually:',
      options: ['Very cold throughout the year', 'Warm and humid', 'Dry all year', 'Covered by glaciers'],
      correctAnswer: 'Warm and humid',
      explanation: 'Equatorial regions receive direct sunlight through most of the year, so they are usually warm and humid.'
    }
  },
  {
    title: '[G8-CURATED] Sources of history',
    set: {
      body: 'Which option is a primary historical source?',
      options: ['A modern textbook summary', 'A diary written during that period', 'A recent social media post', 'A copied worksheet'],
      correctAnswer: 'A diary written during that period',
      explanation: 'Primary sources are original records created at the time of the event.'
    }
  },
  {
    title: '[G8-CURATED] Safe password practice',
    set: {
      body: 'Which password is the strongest?',
      options: ['12345678', 'mypassword', 'N!9q$7Lm', 'abcdefg'],
      correctAnswer: 'N!9q$7Lm',
      explanation: 'A strong password combines upper/lowercase letters, numbers, and symbols.'
    }
  },
  {
    title: '[G8-CURATED] Fractions with unlike denominators',
    set: {
      body: 'What is 3/4 + 2/3?',
      options: ['17/12', '13/12', '5/7', '1 5/12'],
      correctAnswer: '17/12',
      explanation: 'Use denominator 12: 3/4 = 9/12 and 2/3 = 8/12. Then 9/12 + 8/12 = 17/12.'
    }
  },
  {
    title: '[G8-CURATED] Area of rectangle',
    set: {
      body: 'A rectangle has length 12 cm and width 7 cm. What is its area?',
      options: ['19 cm^2', '84 cm^2', '38 cm^2', '168 cm^2'],
      correctAnswer: '84 cm^2',
      explanation: 'Area of a rectangle = length x width = 12 x 7 = 84 cm^2.'
    }
  },
  {
    title: '[G8-CURATED] Photosynthesis requirement',
    set: {
      body: 'Which gas do plants absorb during photosynthesis?',
      options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 'Carbon dioxide',
      explanation: 'Plants absorb carbon dioxide and use sunlight to produce food.'
    }
  },
  {
    title: '[G8-CURATED] Human digestive system function',
    set: {
      body: 'Name two organs in the human digestive system and explain one function of each organ.',
      correctAnswer: 'A complete answer should name two valid organs (e.g., mouth, stomach, small intestine, liver) and explain one correct function of each.',
      explanation: 'This checks understanding of digestive organs and their specific functions.'
    }
  },
  {
    title: '[G8-CURATED] සිංහල ව්‍යාකරණය - නාම පදය',
    set: {
      body: 'පහත වචන අතරින් නාම පදය කුමක්ද?',
      options: ['දුවන්න', 'අලංකාර', 'ගස', 'වේගයෙන්'],
      correctAnswer: 'ගස',
      explanation: '"ගස" යනු දේවල් නම් කරන නාම පදයකි.'
    }
  },
  {
    title: '[G8-CURATED] தமிழ் இலக்கணம் - பெயர்ச்சொல்',
    set: {
      body: 'கீழ்காணும் சொற்களில் பெயர்ச்சொல் எது?',
      options: ['ஓடு', 'அழகு', 'மரம்', 'வேகமாக'],
      correctAnswer: 'மரம்',
      explanation: '"மரம்" என்பது ஒரு பொருளின் பெயரை குறிக்கும் பெயர்ச்சொல்.'
    }
  },
  {
    title: '[G8-CURATED] தமிழ் வாசிப்பு புரிதல்',
    set: {
      body: 'உங்களுக்கு பிடித்த ஒரு தமிழ் கதையை 4-5 வரிகளில் சுருக்கமாக எழுதுங்கள்.',
      correctAnswer: 'சரியான பதில் கதையின் முக்கிய நிகழ்வுகள், பாத்திரங்கள், மற்றும் கருத்தை தெளிவாகச் சொல்ல வேண்டும்.',
      explanation: 'இது வாசிப்பு புரிதல் மற்றும் சுருக்க எழுத்துத் திறனை மதிப்பிடுகிறது.'
    }
  }
];

async function reviseGrade8LogicalQuestions() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/peerlearn';
  await mongoose.connect(mongoUri);

  let updated = 0;

  for (const item of updates) {
    const result = await Question.updateOne(
      { grade: 8, tags: 'curated-logical-v1', title: item.title },
      { $set: item.set }
    );
    if (result.modifiedCount > 0) updated += 1;
  }

  console.log(`Grade 8 curated revision complete. Updated: ${updated}/${updates.length}`);
  await mongoose.connection.close();
}

reviseGrade8LogicalQuestions().catch(async (error) => {
  console.error('Grade 8 curated revision failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
