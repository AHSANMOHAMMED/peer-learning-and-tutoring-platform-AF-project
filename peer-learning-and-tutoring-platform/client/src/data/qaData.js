export const grades = [6, 7, 8, 9, 10, 11];

export const qaForumSupportedGrades = [6, 8, 9];

export const gradeLabels = {
  6: 'Grade 6',
  7: 'Grade 7',
  8: 'Grade 8',
  9: 'Grade 9',
  10: 'Grade 10',
  11: 'Grade 11'
};

export const supportedMediums = ['Tamil', 'Sinhala', 'English'];

const preferredMediumStorageKey = 'peerlearn-qa-preferred-medium';

export const loadPreferredMedium = () => {
  if (typeof window === 'undefined') return 'English';
  const stored = window.localStorage.getItem(preferredMediumStorageKey);
  return stored && supportedMediums.includes(stored) ? stored : 'English';
};

export const savePreferredMedium = (medium) => {
  if (typeof window === 'undefined') return;
  if (supportedMediums.includes(medium)) {
    window.localStorage.setItem(preferredMediumStorageKey, medium);
  }
};

const qaUiText = {
  English: {
    mediumSelection: {
      preferredExamMedium: 'Preferred exam medium',
      chooseLearningMedium: 'Choose your learning medium',
      description: 'Pick the language that helps you feel most comfortable while practicing. You can change this anytime before starting a new topic.',
      mediumBadge: 'Medium',
      selected: 'Selected',
      currentPreferredMedium: 'Current preferred medium',
      continueToGradeSelection: 'Continue to grade selection',
      cardDescription: (medium) => `Practice questions with ${medium} as your preferred medium.`
    },
    gradeSelection: {
      chooseYourGrade: 'Choose Your Grade',
      forumInfo: 'QA forum is currently enabled for Grades 6, 8, and 9. Only your registered grade is active.',
      preferredMedium: 'Preferred medium',
      pleaseLogin: 'Please log in to open your grade.',
      loginNow: 'Log in now',
      yourGrade: 'Your Grade',
      locked: 'Locked',
      gradeCardDescription: (grade) => `Good for grade ${grade} learners with clear subject practice and friendly review.`,
      yourAssignedGrade: 'Your assigned grade',
      yourAssignedGradeDesc: (grade) => `Grade ${grade || 'not set yet'} is the grade you can use in the Q&A Forum.`,
      profileHint: 'If your grade is not set correctly, update your profile from the dashboard.',
      tutorAssignedGrade: 'Tutor assigned grade',
      tutorAssignedGradeDesc: (grade) => `Grade ${grade || 'not set yet'} is unlocked for your tutor Q&A workflow.`,
      tutorHint: 'If your grade is missing, update your profile or ask admin to assign Grade 6, 8, or 9.'
    },
    subjectSelection: {
      chooseSubject: 'Choose a Subject',
      subjectsForGrade: (grade) => `Subjects for Grade ${grade}`,
      backToGrades: 'Back to grades',
      accessUnavailable: 'Access unavailable',
      accessByGrade: (grade) => `You can only open subjects for the grade selected during signup. Please log in with a student account for Grade ${grade}.`,
      accessUnsupported: 'This QA forum currently supports Grades 6, 8, and 9 only.',
      login: 'Log in',
      chooseYourGrade: 'Choose your grade',
      practiceQuestions: (grade, subject) => `Practice questions for Grade ${grade} in ${subject}.`
    },
    history: {
      activityHistoryTag: 'Q&A activity history',
      yourPracticeHistory: 'Your practice history',
      historyDescription: 'Review your recent question attempts, filter by difficulty or type, and keep track of progress over time.',
      preferredMedium: 'Preferred medium',
      changeMedium: 'Change medium',
      stats: 'Stats',
      totalAttempts: 'Total attempts',
      correctAttempts: 'Correct attempts',
      mostRecent: 'Most recent',
      noActivityYet: 'No activity yet',
      quickActions: 'Quick actions',
      continuePractice: 'Continue practice',
      searchPlaceholder: 'Search subject or question...',
      allDifficulties: 'All difficulties',
      allQuestionTypes: 'All question types',
      structuredEssay: 'Structured / essay',
      sortByNewest: 'Sort by newest',
      sortByDifficulty: 'Sort by difficulty',
      sortByPoints: 'Sort by points',
      noActivityFound: 'No activity found yet.',
      noActivityHint: 'Start answering questions to build your practice history.',
      difficulty: 'Difficulty',
      type: 'Type',
      points: 'Points',
      score: 'Score',
      grade: 'Grade',
      pleaseLogin: 'Please log in',
      loginRequired: 'You must sign in as a student to view your Q&A activity history.',
      login: 'Log in',
      mcq: 'MCQ',
      structured: 'Structured'
    }
  },
  Sinhala: {
    mediumSelection: {
      preferredExamMedium: 'ප්‍රියතම විභාග මාධ්‍යය',
      chooseLearningMedium: 'ඔබගේ ඉගෙනුම් මාධ්‍යය තෝරන්න',
      description: 'පුහුණුවේදී ඔබට වඩාත් පහසු භාෂාව තෝරන්න. නව මාතෘකාවක් ආරම්භ කිරීමට පෙර මෙය ඕනෑම වේලාවක වෙනස් කළ හැකිය.',
      mediumBadge: 'මාධ්‍යය',
      selected: 'තෝරා ඇත',
      currentPreferredMedium: 'වත්මන් ප්‍රියතම මාධ්‍යය',
      continueToGradeSelection: 'ශ්‍රේණි තේරීමට ඉදිරියට යන්න',
      cardDescription: (medium) => `${medium} මාධ්‍යයෙන් පුහුණු ප්‍රශ්න.`
    },
    gradeSelection: {
      chooseYourGrade: 'ඔබගේ ශ්‍රේණිය තෝරන්න',
      forumInfo: 'QA සංසදය දැනට ක්‍රියාත්මක වන්නේ 6, 8 සහ 9 ශ්‍රේණි සඳහා පමණි. ඔබ ලියාපදිංචි කළ ශ්‍රේණිය පමණක් සක්‍රීය වේ.',
      preferredMedium: 'ප්‍රියතම මාධ්‍යය',
      pleaseLogin: 'ඔබගේ ශ්‍රේණිය විවෘත කිරීමට පිවිසෙන්න.',
      loginNow: 'දැන් පිවිසෙන්න',
      yourGrade: 'ඔබගේ ශ්‍රේණිය',
      locked: 'අගුළු දමා ඇත',
      gradeCardDescription: (grade) => `${grade} ශ්‍රේණියේ සිසුන් සඳහා සුදුසු පුහුණු ප්‍රශ්න.`,
      yourAssignedGrade: 'ඔබට පවරා ඇති ශ්‍රේණිය',
      yourAssignedGradeDesc: (grade) => `Q&A සංසදය භාවිතා කිරීමට ඔබගේ ශ්‍රේණිය ${grade || 'තවම සකසා නැත'} වේ.`,
      profileHint: 'ඔබගේ ශ්‍රේණිය වැරදි නම් dashboard තුළ profile යාවත්කාලීන කරන්න.',
      tutorAssignedGrade: 'ටියුටර්ට පවරා ඇති ශ්‍රේණිය',
      tutorAssignedGradeDesc: (grade) => `ටියුටර් Q&A සඳහා විවෘත ශ්‍රේණිය ${grade || 'තවම සකසා නැත'} වේ.`,
      tutorHint: 'ශ්‍රේණිය නොපෙන්වයි නම් profile යාවත්කාලීන කරන්න හෝ admin අමතන්න.'
    },
    subjectSelection: {
      chooseSubject: 'විෂයයක් තෝරන්න',
      subjectsForGrade: (grade) => `${grade} ශ්‍රේණිය සඳහා විෂයයන්`,
      backToGrades: 'ශ්‍රේණි වෙත ආපසු',
      accessUnavailable: 'ප්‍රවේශය නොමැත',
      accessByGrade: (grade) => `ලියාපදිංචියදී තෝරාගත් ${grade} ශ්‍රේණියට පමණක් ප්‍රවේශ විය හැක.`,
      accessUnsupported: 'මෙම QA සංසදය දැනට සහාය දක්වන්නේ 6, 8 සහ 9 ශ්‍රේණි සඳහා පමණි.',
      login: 'පිවිසෙන්න',
      chooseYourGrade: 'ඔබගේ ශ්‍රේණිය තෝරන්න',
      practiceQuestions: (grade, subject) => `${grade} ශ්‍රේණිය සඳහා ${subject} විෂයේ පුහුණු ප්‍රශ්න.`
    },
    history: {
      activityHistoryTag: 'Q&A ක්‍රියාකාරී ඉතිහාසය',
      yourPracticeHistory: 'ඔබගේ පුහුණු ඉතිහාසය',
      historyDescription: 'ඔබගේ මෑත උත්සාහයන් සමාලෝචනය කර, අපහසුතාව හෝ වර්ග අනුව පෙරහන් කර ප්‍රගතිය නිරීක්ෂණය කරන්න.',
      preferredMedium: 'ප්‍රියතම මාධ්‍යය',
      changeMedium: 'මාධ්‍යය වෙනස් කරන්න',
      stats: 'සංඛ්‍යාලේඛන',
      totalAttempts: 'මුළු උත්සාහයන්',
      correctAttempts: 'නිවැරදි උත්සාහයන්',
      mostRecent: 'අවසන් වරට',
      noActivityYet: 'තවම ක්‍රියාකාරකම් නොමැත',
      quickActions: 'ඉක්මන් ක්‍රියා',
      continuePractice: 'පුහුණුව දිගටම',
      searchPlaceholder: 'විෂයය හෝ ප්‍රශ්නය සොයන්න...',
      allDifficulties: 'සියලු අපහසුතා',
      allQuestionTypes: 'සියලු ප්‍රශ්න වර්ග',
      structuredEssay: 'ව්‍යුහගත / රචනා',
      sortByNewest: 'අලුත්ම අනුව',
      sortByDifficulty: 'අපහසුතාව අනුව',
      sortByPoints: 'ලකුණු අනුව',
      noActivityFound: 'තවම ක්‍රියාකාරී ඉතිහාසයක් නැත.',
      noActivityHint: 'ඉතිහාසය සෑදීමට ප්‍රශ්න උත්සාහ කරන්න.',
      difficulty: 'අපහසුතාව',
      type: 'වර්ගය',
      points: 'ලකුණු',
      score: 'ප්‍රතිඵලය',
      grade: 'ශ්‍රේණිය',
      pleaseLogin: 'කරුණාකර පිවිසෙන්න',
      loginRequired: 'ඔබගේ Q&A ඉතිහාසය බැලීමට ශිෂ්‍ය ගිණුමකින් පිවිසිය යුතුය.',
      login: 'පිවිසෙන්න',
      mcq: 'බහු තේරීම්',
      structured: 'ව්‍යුහගත'
    }
  },
  Tamil: {
    mediumSelection: {
      preferredExamMedium: 'விருப்பத் தேர்வு மூலம்',
      chooseLearningMedium: 'உங்கள் கற்றல் மொழியைத் தேர்வுசெய்க',
      description: 'பயிற்சியின் போது உங்களுக்கு வசதியான மொழியைத் தேர்வு செய்யுங்கள். புதிய தலைப்பைத் தொடங்கும் முன் இதை எப்போதும் மாற்றலாம்.',
      mediumBadge: 'மூலம்',
      selected: 'தேர்வு செய்யப்பட்டது',
      currentPreferredMedium: 'தற்போதைய விருப்ப மூலம்',
      continueToGradeSelection: 'வகுப்பு தேர்வுக்கு தொடர்க',
      cardDescription: (medium) => `${medium} மூலம் பயிற்சி கேள்விகள்.`
    },
    gradeSelection: {
      chooseYourGrade: 'உங்கள் வகுப்பைத் தேர்வுசெய்க',
      forumInfo: 'QA தளம் தற்போது 6, 8, 9 வகுப்புகளுக்கு மட்டும் செயலில் உள்ளது. நீங்கள் பதிவு செய்த வகுப்பு மட்டும் திறந்திருக்கும்.',
      preferredMedium: 'விருப்ப மூலம்',
      pleaseLogin: 'உங்கள் வகுப்பை திறக்க உள்நுழையவும்.',
      loginNow: 'இப்போது உள்நுழை',
      yourGrade: 'உங்கள் வகுப்பு',
      locked: 'பூட்டப்பட்டது',
      gradeCardDescription: (grade) => `${grade} ஆம் வகுப்பு மாணவர்களுக்கு ஏற்ற பயிற்சி கேள்விகள்.`,
      yourAssignedGrade: 'உங்களுக்கு ஒதுக்கப்பட்ட வகுப்பு',
      yourAssignedGradeDesc: (grade) => `Q&A தளத்தில் பயன்படுத்தும் வகுப்பு ${grade || 'இன்னும் அமைக்கப்படவில்லை'}.`,
      profileHint: 'வகுப்பு தவறாக இருந்தால் dashboard-ல் profile புதுப்பிக்கவும்.',
      tutorAssignedGrade: 'Tutor-க்கு ஒதுக்கப்பட்ட வகுப்பு',
      tutorAssignedGradeDesc: (grade) => `Tutor Q&A வேலைப்போக்கிற்கான வகுப்பு ${grade || 'இன்னும் அமைக்கப்படவில்லை'}.`,
      tutorHint: 'வகுப்பு காணப்படாவிட்டால் profile புதுப்பிக்கவும் அல்லது admin-ஐ தொடர்புகொள்ளவும்.'
    },
    subjectSelection: {
      chooseSubject: 'ஒரு பாடத்தைத் தேர்வு செய்க',
      subjectsForGrade: (grade) => `${grade} ஆம் வகுப்புக்கான பாடங்கள்`,
      backToGrades: 'வகுப்புகளுக்கு திரும்பு',
      accessUnavailable: 'அணுகல் இல்லை',
      accessByGrade: (grade) => `பதிவு செய்த ${grade} ஆம் வகுப்புக்கே அணுகலாம்.`,
      accessUnsupported: 'இந்த QA தளம் தற்போது 6, 8, 9 வகுப்புகளுக்கு மட்டும் ஆதரவு அளிக்கிறது.',
      login: 'உள்நுழை',
      chooseYourGrade: 'உங்கள் வகுப்பைத் தேர்வுசெய்க',
      practiceQuestions: (grade, subject) => `${grade} ஆம் வகுப்பிற்கு ${subject} பாடப் பயிற்சி கேள்விகள்.`
    },
    history: {
      activityHistoryTag: 'Q&A செயல்பாட்டு வரலாறு',
      yourPracticeHistory: 'உங்கள் பயிற்சி வரலாறு',
      historyDescription: 'சமீபத்திய முயற்சிகளைப் பாருங்கள், சிரம நிலை/வகை படி வடிகட்டி முன்னேற்றத்தை கண்காணிக்கவும்.',
      preferredMedium: 'விருப்ப மூலம்',
      changeMedium: 'மூலத்தை மாற்று',
      stats: 'புள்ளிவிவரங்கள்',
      totalAttempts: 'மொத்த முயற்சிகள்',
      correctAttempts: 'சரியான முயற்சிகள்',
      mostRecent: 'சமீபத்தியது',
      noActivityYet: 'இன்னும் செயல்பாடு இல்லை',
      quickActions: 'விரைவு செயல்கள்',
      continuePractice: 'பயிற்சியை தொடர்க',
      searchPlaceholder: 'பாடம் அல்லது கேள்வி தேடுங்கள்...',
      allDifficulties: 'அனைத்து சிரம நிலைகள்',
      allQuestionTypes: 'அனைத்து கேள்வி வகைகள்',
      structuredEssay: 'கட்டமைக்கப்பட்ட / கட்டுரை',
      sortByNewest: 'புதியவை முதலில்',
      sortByDifficulty: 'சிரம நிலைப்படி',
      sortByPoints: 'மதிப்பெண் படி',
      noActivityFound: 'இன்னும் முயற்சி வரலாறு இல்லை.',
      noActivityHint: 'வரலாறு உருவாக கேள்விகளை முயற்சி செய்யுங்கள்.',
      difficulty: 'சிரம நிலை',
      type: 'வகை',
      points: 'மதிப்பெண்',
      score: 'மதிப்பீடு',
      grade: 'வகுப்பு',
      pleaseLogin: 'தயவு செய்து உள்நுழையவும்',
      loginRequired: 'Q&A வரலாறைப் பார்க்க மாணவர் கணக்கில் உள்நுழைய வேண்டும்.',
      login: 'உள்நுழை',
      mcq: 'பல்தேர்வு',
      structured: 'கட்டமைக்கப்பட்டது'
    }
  }
};

export const getQAUiText = (medium) => qaUiText[medium] || qaUiText.English;

const getQAHistoryKey = (userId) => `peerlearn-qa-history:${userId}`;

export const loadQAHistory = (userId) => {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = window.localStorage.getItem(getQAHistoryKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQAAttempt = (userId, attempt) => {
  if (typeof window === 'undefined' || !userId) return;
  const existing = loadQAHistory(userId);
  const history = [attempt, ...existing].slice(0, 100);
  window.localStorage.setItem(getQAHistoryKey(userId), JSON.stringify(history));
  return history;
};

const customQuestionsStorageKey = 'peerlearn-qa-custom-questions';

export const loadCustomQuestions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(customQuestionsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomQuestions = (questions) => {
  if (typeof window === 'undefined') return [];
  const safeQuestions = Array.isArray(questions) ? questions : [];
  window.localStorage.setItem(customQuestionsStorageKey, JSON.stringify(safeQuestions));
  return safeQuestions;
};

export const upsertCustomQuestion = (question) => {
  if (!question?.id) return loadCustomQuestions();
  const existing = loadCustomQuestions();
  const updated = [question, ...existing.filter((item) => item.id !== question.id)];
  return saveCustomQuestions(updated);
};

export const deleteCustomQuestionById = (questionId) => {
  if (!questionId) return loadCustomQuestions();
  const existing = loadCustomQuestions();
  const updated = existing.filter((item) => item.id !== questionId);
  return saveCustomQuestions(updated);
};

export const getCombinedQuestionBank = () => {
  const customQuestions = loadCustomQuestions();
  const overriddenIds = new Set(customQuestions.map((q) => q.id));
  return [...customQuestions, ...questionBank.filter((q) => !overriddenIds.has(q.id))];
};

const qaSubmissionsStorageKey = 'peerlearn-qa-submissions';

export const loadQASubmissions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(qaSubmissionsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveQASubmission = (submission) => {
  if (typeof window === 'undefined' || !submission) return [];
  const existing = loadQASubmissions();
  const next = [submission, ...existing].slice(0, 300);
  window.localStorage.setItem(qaSubmissionsStorageKey, JSON.stringify(next));
  return next;
};

export const subjectsByGrade = {
  6: [
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
  ],
  7: ['Mathematics', 'Science', 'English', 'History'],
  8: [
    'Sinhala',
    'Tamil',
    'English Language',
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Civic Education',
    'Buddhism',
    'Hinduism',
    'Islam',
    'Christianity',
    'Art',
    'Dancing',
    'Music',
    'Drama & Theatre',
    'ICT',
    'Health & Physical Education',
    'Life Competencies'
  ],
  9: [
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
  ],
  10: ['Mathematics', 'Biology', 'English', 'History'],
  11: ['Mathematics', 'Chemistry', 'English', 'ICT']
};

export const subjectTranslations = {
  Mathematics: { Tamil: 'கணிதம்', Sinhala: 'ගණිතය', English: 'Mathematics' },
  Science: { Tamil: 'அறிவியல்', Sinhala: 'විද්‍යාව', English: 'Science' },
  English: { Tamil: 'ஆங்கிலம்', Sinhala: 'ඉංග්‍රීසි', English: 'English' },
  Sinhala: { Tamil: 'சிங்களம்', Sinhala: 'සිංහල', English: 'Sinhala' },
  Tamil: { Tamil: 'தமிழ்', Sinhala: 'තමිළ', English: 'Tamil' },
  'English Language': { Tamil: 'ஆங்கில மொழி', Sinhala: 'ඉංග්‍රීසි භාෂාව', English: 'English Language' },
  History: { Tamil: 'வரலாறு', Sinhala: 'ඉතිහාසය', English: 'History' },
  Geography: { Tamil: 'புவியியல்', Sinhala: 'භූගෝලය', English: 'Geography' },
  'Civic Education': { Tamil: 'நகராட்சி கல்வி', Sinhala: 'නාගරික අධ්‍යාපනය', English: 'Civic Education' },
  Buddhism: { Tamil: 'புத்த மதம்', Sinhala: 'බුද්ධාගම', English: 'Buddhism' },
  Hinduism: { Tamil: 'இந்து மதம்', Sinhala: 'හින්දු ආගම', English: 'Hinduism' },
  Islam: { Tamil: 'இஸ்லாம்', Sinhala: 'ඉස්ලාම්', English: 'Islam' },
  Christianity: { Tamil: 'கிறிஸ்தவம்', Sinhala: 'ක්‍රිස්තියානි ආගම', English: 'Christianity' },
  Art: { Tamil: 'கலை', Sinhala: 'කලාව', English: 'Art' },
  Dancing: { Tamil: 'நடனம்', Sinhala: 'නර්තනය', English: 'Dancing' },
  Music: { Tamil: 'இசை', Sinhala: 'සංගීතය', English: 'Music' },
  'Drama & Theatre': { Tamil: 'நாடகம் மற்றும் மேடை', Sinhala: 'නාට්‍යය සහ රංගනය', English: 'Drama & Theatre' },
  ICT: { Tamil: 'தகவல் மற்றும் தொடர்பு தொழில்நுட்பம்', Sinhala: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය', English: 'ICT' },
  'Health & Physical Education': { Tamil: 'உடல்நலம் மற்றும் உடற்பயிற்சி கல்வி', Sinhala: 'සෞඛ්‍ය හා ශාරීරික අධ්‍යාපනය', English: 'Health & Physical Education' },
  'Life Competencies': { Tamil: 'வாழ்க்கை திறன்கள்', Sinhala: 'ජීවන කුසලතා', English: 'Life Competencies' },
  'Life Competencies and Citizenship Education': {
    Tamil: 'வாழ்க்கைத் திறன்கள் மற்றும் குடியுரிமைக் கல்வி',
    Sinhala: 'ජීවන කුසලතා සහ පුරවැසි අධ්‍යාපනය',
    English: 'Life Competencies and Citizenship Education'
  },
  Catholicism: { Tamil: 'கத்தோலிக்கம்', Sinhala: 'කතෝලික ආගම', English: 'Catholicism' },
  'Eastern Music': { Tamil: 'கிழக்கு இசை', Sinhala: 'නැගෙනහිර සංගීතය', English: 'Eastern Music' },
  'Western Music': { Tamil: 'மேற்கு இசை', Sinhala: 'බටහිර සංගීතය', English: 'Western Music' },
  'Practical & Technical Skills': {
    Tamil: 'நடைமுறை மற்றும் தொழில்நுட்ப திறன்கள்',
    Sinhala: 'ප්‍රායෝගික හා තාක්ෂණික කුසලතා',
    English: 'Practical & Technical Skills'
  },
  Physics: { Tamil: 'புவியியல்', Sinhala: 'භෞතික විද්‍යාව', English: 'Physics' },
  Biology: { Tamil: 'உயிரியல்', Sinhala: 'ජීව විද්‍යාව', English: 'Biology' },
  Chemistry: { Tamil: 'இயற்பியல் வேதியியல்', Sinhala: 'රසායන විද්‍යාව', English: 'Chemistry' }
};

export const getLocalizedSubjectName = (subject, medium) => {
  if (!subject) return '';
  const translations = subjectTranslations[subject];
  return translations?.[medium] || subject;
};

export const isTamilSubjectName = (subject) => {
  const value = String(subject || '').trim().toLowerCase();
  return value === 'tamil' || value.includes('tamil') || value.includes('தமிழ்') || value.includes('තමි');
};

export const isEnglishSubjectName = (subject) => {
  const value = String(subject || '').trim().toLowerCase();
  return value === 'english' || value.includes('english') || value.includes('ඉංග්‍රීසි') || value.includes('ஆங்கில');
};

export const getEffectiveQuestionMedium = (subject, preferredMedium) => {
  if (isTamilSubjectName(subject)) return 'Tamil';
  if (isEnglishSubjectName(subject)) return 'English';
  return preferredMedium;
};

const localizeOptionValue = (value, medium) => {
  if (typeof value !== 'string') return value;

  return getLocalizedSubjectName(value, medium);
};

export const getLocalizedDifficultyLabel = (difficulty, medium) => {
  const key = String(difficulty || '').trim();
  if (!key) return key;

  if (medium === 'Sinhala') {
    if (key === 'Easy') return 'පහසු';
    if (key === 'Medium') return 'මධ්‍යම';
    if (key === 'Hard') return 'අපහසු';
    if (key === 'Expert') return 'උසස්';
  }

  if (medium === 'Tamil') {
    if (key === 'Easy') return 'எளிது';
    if (key === 'Medium') return 'நடுத்தரம்';
    if (key === 'Hard') return 'கடினம்';
    if (key === 'Expert') return 'மேம்பட்ட';
  }

  return key;
};

export const getLocalizedQuestion = (question, medium) => {
  if (!question) return question;
  const effectiveMedium = getEffectiveQuestionMedium(question.subject, medium);
  const translation = question.translations?.[effectiveMedium];
  const baseQuestion = translation
    ? {
        ...question,
        title: translation.title || question.title,
        body: translation.body || question.body,
        options: translation.options || question.options,
        correctAnswer: translation.correctAnswer || question.correctAnswer,
        explanation: translation.explanation || question.explanation
      }
    : { ...question };

  const localizedOptions = Array.isArray(baseQuestion.options)
    ? baseQuestion.options.map((option) => localizeOptionValue(option, effectiveMedium))
    : baseQuestion.options;

  const localizedCorrectAnswer = typeof baseQuestion.correctAnswer === 'string'
    ? localizeOptionValue(baseQuestion.correctAnswer, effectiveMedium)
    : baseQuestion.correctAnswer;

  return {
    ...baseQuestion,
    difficulty: getLocalizedDifficultyLabel(baseQuestion.difficulty, effectiveMedium),
    options: localizedOptions,
    correctAnswer: localizedCorrectAnswer
  };
};

const slugify = (subject) => subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buildQuestions = (grade, subject, questions) => {
  const subjectSlug = slugify(subject);
  return questions.map((question, index) => ({
    id: `g${grade}-${subjectSlug}-${question.type}-${index + 1}`,
    grade,
    subject,
    type: question.type,
    title: question.title,
    difficulty: question.difficulty,
    points: question.points,
    body: question.body,
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    translations: question.translations || {}
  }));
};

const buildMixedQuestionsForSubject = (grade, subject) => {
  const tamilSubject = subjectTranslations[subject]?.Tamil || subject;
  const sinhalaSubject = subjectTranslations[subject]?.Sinhala || subject;
  const optionsA = [
    subject,
    ...['Mathematics', 'Science', 'History', 'Geography', 'English Language'].filter((item) => item !== subject)
  ].slice(0, 4);
  const optionsB = ['Easy', 'Medium', 'Hard', 'Expert'];

  return [
    {
      type: 'mcq',
      title: `${subject} fundamentals`,
      difficulty: 'Easy',
      points: 5,
      body: `Identify the subject category for this Grade ${grade} practice item.`,
      options: optionsA,
      correctAnswer: subject,
      explanation: `This practice item belongs to ${subject}.`,
      translations: {
        Tamil: {
          title: `${tamilSubject} அடிப்படைகள்`,
          body: `இந்த Grade ${grade} பயிற்சி கேள்வி எந்த பாடத்திற்குச் சேர்கிறது என்பதைத் தேர்வு செய்யவும்.`,
          options: optionsA,
          correctAnswer: subject,
          explanation: `இந்த பயிற்சி வினா ${tamilSubject} பாடத்திற்குச் சேர்ந்தது.`
        },
        Sinhala: {
          title: `${sinhalaSubject} මූලික කරුණු`,
          body: `මෙම Grade ${grade} පුහුණු ප්‍රශ්නය අයත් විෂය තෝරන්න.`,
          options: optionsA,
          correctAnswer: subject,
          explanation: `මෙම පුහුණු අයිතමය ${sinhalaSubject} විෂයට අයත් වේ.`
        }
      }
    },
    {
      type: 'mcq',
      title: `Difficulty level in ${subject}`,
      difficulty: 'Easy',
      points: 5,
      body: `Choose the level that is usually shown in this question bank.`,
      options: optionsB,
      correctAnswer: 'Easy',
      explanation: `The question bank uses Easy, Medium and Hard levels.`,
      translations: {
        Tamil: {
          title: `${tamilSubject} பாடத்தில் சிரம நிலை`,
          body: `இந்த வினாத்தொகுப்பில் பொதுவாக காட்டப்படும் நிலையைத் தேர்வு செய்யவும்.`,
          options: optionsB,
          correctAnswer: 'Easy',
          explanation: `இந்த வினாத்தொகுப்பில் Easy, Medium, Hard நிலைகள் பயன்படுத்தப்படுகின்றன.`
        },
        Sinhala: {
          title: `${sinhalaSubject} විෂයේ අපහසුතා මට්ටම`,
          body: `මෙම ප්‍රශ්න බැංකුවේ සාමාන්‍යයෙන් පෙන්වන මට්ටම තෝරන්න.`,
          options: optionsB,
          correctAnswer: 'Easy',
          explanation: `මෙම ප්‍රශ්න බැංකුවේ Easy, Medium, Hard මට්ටම් භාවිතා වේ.`
        }
      }
    },
    {
      type: 'structured',
      title: `Key concepts of ${subject}`,
      difficulty: 'Medium',
      points: 10,
      body: `Write two important concepts you learn in Grade ${grade} ${subject}.`,
      correctAnswer: `A good answer should clearly mention two correct core concepts in ${subject}.`,
      explanation: `This checks understanding of the syllabus and concept naming.`,
      translations: {
        Tamil: {
          title: `${tamilSubject} பாடத்தின் முக்கியக் கருத்துகள்`,
          body: `Grade ${grade} ${tamilSubject} பாடத்தில் கற்றுக்கொள்ளும் இரண்டு முக்கிய கருத்துகளை எழுதவும்.`,
          correctAnswer: `${tamilSubject} பாடத்தின் இரண்டு சரியான அடிப்படை கருத்துகளை தெளிவாக எழுத வேண்டும்.`,
          explanation: `பாடத்திட்டப் புரிதல் மற்றும் கருத்து அடையாளத்தை இது சோதிக்கிறது.`
        },
        Sinhala: {
          title: `${sinhalaSubject} විෂයේ ප්‍රධාන සංකල්ප`,
          body: `Grade ${grade} ${sinhalaSubject} විෂයේ ඉගෙන ගන්නා ප්‍රධාන සංකල්ප දෙකක් ලියන්න.`,
          correctAnswer: `${sinhalaSubject} විෂයේ නිවැරදි මූලික සංකල්ප දෙකක් පැහැදිලිව සඳහන් කළ යුතුය.`,
          explanation: `මෙය පාඩම්මාලා අවබෝධය සහ සංකල්ප හඳුනාගැනීම පරීක්ෂා කරයි.`
        }
      }
    },
    {
      type: 'structured',
      title: `Apply ${subject} in daily life`,
      difficulty: 'Medium',
      points: 10,
      body: `Give one daily-life example where ${subject} knowledge is useful and explain why.`,
      correctAnswer: `A good response gives a realistic example and explains the usefulness clearly.`,
      explanation: `This measures practical understanding and communication clarity.`,
      translations: {
        Tamil: {
          title: `${tamilSubject} ஐ நாளந்தோறும் வாழ்க்கையில் பயன்படுத்துதல்`,
          body: `${tamilSubject} அறிவு பயனுள்ளதாக இருக்கும் ஒரு நாளாந்த உதாரணத்தை கொடுத்து ஏன் என்று விளக்கவும்.`,
          correctAnswer: `ஒரு உண்மையான உதாரணம் கொடுத்து அதன் பயனை தெளிவாக விளக்க வேண்டும்.`,
          explanation: `இது நடைமுறைப் புரிதல் மற்றும் தெளிவான விளக்கத் திறனை மதிப்பிடுகிறது.`
        },
        Sinhala: {
          title: `${sinhalaSubject} දැනුම දෛනික ජීවිතයට යොදා ගැනීම`,
          body: `${sinhalaSubject} දැනුම ප්‍රයෝජනවත් වන දෛනික උදාහරණයක් දී එය ඇයි වැදගත්ද කියා පැහැදිලි කරන්න.`,
          correctAnswer: `යථාර්ථ උදාහරණයක් සමඟ එහි ප්‍රයෝජනය පැහැදිලිව විස්තර කළ යුතුය.`,
          explanation: `මෙය ප්‍රායෝගික අවබෝධය සහ පැහැදිලි සන්නිවේදනය මැනේ.`
        }
      }
    },
    {
      type: 'essay',
      title: `Essay: Why ${subject} matters`,
      difficulty: 'Hard',
      points: 15,
      body: `Write a short essay about why learning ${subject} is important for Grade ${grade} students.`,
      correctAnswer: `A strong essay should include importance, real-life relevance, and personal learning benefits.`,
      explanation: `The essay is evaluated for idea quality, structure, and relevance.`,
      translations: {
        Tamil: {
          title: `கட்டுரை: ${tamilSubject} ஏன் முக்கியம்`,
          body: `Grade ${grade} மாணவர்களுக்கு ${tamilSubject} கற்றல் ஏன் முக்கியம் என்பதைப் பற்றி ஒரு குறுங்கட்டுரை எழுதவும்.`,
          correctAnswer: `முக்கியத்துவம், வாழ்க்கைப் பயன்பாடு, மற்றும் தனிப்பட்ட கற்றல் நன்மைகள் இடம்பெற வேண்டும்.`,
          explanation: `கருத்துத் தரம், கட்டமைப்பு, மற்றும் பொருத்தம் அடிப்படையில் மதிப்பிடப்படும்.`
        },
        Sinhala: {
          title: `රචනය: ${sinhalaSubject} ඇයි වැදගත්`,
          body: `Grade ${grade} සිසුන්ට ${sinhalaSubject} ඉගෙනීම වැදගත් වන්නේ ඇයි යන්න පිළිබඳ කෙටි රචනයක් ලියන්න.`,
          correctAnswer: `වැදගත්කම, දෛනික ජීවිතයට අදාල බව සහ පුද්ගලික ඉගෙනුම් ප්‍රතිලාභ ඇතුළත් විය යුතුය.`,
          explanation: `අදහස් ගුණාත්මකභාවය, ව්‍යුහය සහ අදාළතාව අනුව ඇගයේ.`
        }
      }
    }
  ];
};

const buildMixedQuestionBankForSubjects = (grade, subjects) =>
  subjects.flatMap((subject) =>
    buildQuestions(grade, subject, buildMixedQuestionsForSubject(grade, subject)).map((question, idx) => ({
      ...question,
      id: `${question.id}-auto-${idx + 1}`
    }))
  );

export const questionBank = [
  ...buildQuestions(6, 'Mathematics', [
    {
      type: 'mcq',
      title: 'What is 7 × 8?',
      difficulty: 'Easy',
      points: 5,
      body: 'Calculate the product of 7 and 8.',
      options: ['54', '56', '63', '49'],
      correctAnswer: '56',
      explanation: '7 multiplied by 8 equals 56.',
      translations: {
        Tamil: {
          title: '7 × 8 என்பது என்ன?',
          body: '7 மற்றும் 8 இன் பெருக்கத்தை கணக்கிடுங்கள்.',
          options: ['54', '56', '63', '49'],
          correctAnswer: '56',
          explanation: '7 ஐ 8 கொண்டு பெருக்கினால் 56 கிடைக்கிறது.'
        },
        Sinhala: {
          title: '7 × 8 යනු කුමක්ද?',
          body: '7 සහ 8 ගුණකරය ගණනය කරන්න.',
          options: ['54', '56', '63', '49'],
          correctAnswer: '56',
          explanation: '7 ට 8 ගුණකළ විට 56 වේ.'
        }
      }
    }
  ]),
  ...buildQuestions(6, 'Science', [
    {
      type: 'mcq',
      title: 'Which planet is known as the Red Planet?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct planet name.',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars',
      explanation: 'Mars is called the Red Planet because of its reddish surface.',
      translations: {
        Tamil: {
          title: 'எந்த கிரகம் சிவப்பு கிரகமாக அறியப்படுகிறது?',
          body: 'சரி கிரகத்தின் பெயரை தேர்வு செய்.',
          options: ['வீனஸ்', 'மார்ஸ்', 'ஜூபிட்டர்', 'சாட்டர்ன்'],
          correctAnswer: 'மார்ஸ்',
          explanation: 'மார்ஸ் சிவப்பு கிரகமாக அழைக்கப்படுகிறது.'
        },
        Sinhala: {
          title: 'රතු ග්‍රහය ලෙස හැඳින්වෙන්නේ කුමන ග්‍රහයද?',
          body: 'නිවැරදි ග්‍රහය තෝරන්න.',
          options: ['වීනස්', 'මාර්ස්', 'ජුපිටර්', 'සාටර්න්'],
          correctAnswer: 'මාර්ස්',
          explanation: 'මාර්ස් එහි රතු පාට හේතුවෙන් රතු ග්‍රහයයි.'
        }
      }
    }
  ]),
  ...buildQuestions(7, 'English', [
    {
      type: 'mcq',
      title: 'Choose the correct past tense of "go".',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct past form of the verb go.',
      options: ['Goed', 'Went', 'Goes', 'Gone'],
      correctAnswer: 'Went',
      explanation: 'The past tense of go is went.',
      translations: {
        Tamil: {
          title: '"go" என்ற கூற்றின் சரியான கடந்த காலம் என்ன?',
          body: 'go என்ற குருவின் சரியான கடந்த கால வடிவத்தை தெரிவு செய்.',
          options: ['Goed', 'Went', 'Goes', 'Gone'],
          correctAnswer: 'Went',
          explanation: 'go என்ற சொல்லின் கடந்த காலம் went ஆகும்.'
        },
        Sinhala: {
          title: '"go" වචනයේ නිවැරදි භූත කාලය කුමක්ද?',
          body: 'go ක්‍රියා පදයේ නිවැරදි භූත රූපය තෝරන්න.',
          options: ['Goed', 'Went', 'Goes', 'Gone'],
          correctAnswer: 'Went',
          explanation: 'go වචනයේ භූත කාලය went වේ.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'ICT', [
    {
      type: 'mcq',
      title: 'What does CPU stand for?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct full form of CPU.',
      options: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Unit', 'Control Processing Unit'],
      correctAnswer: 'Central Processing Unit',
      explanation: 'CPU stands for Central Processing Unit.',
      translations: {
        Tamil: {
          title: 'CPU என்பது எந்த சொல்லின் சுருக்கம்?',
          body: 'CPU யின் முழு பெயரை தேர்வு செய்யவும்.',
          options: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Unit', 'Control Processing Unit'],
          correctAnswer: 'Central Processing Unit',
          explanation: 'CPU என்பது Central Processing Unit என்ற сөзத்தின் சுருக்கம்.'
        },
        Sinhala: {
          title: 'CPU යනු කුමන වචනයේ සංක්ෂේපයද?',
          body: 'CPU හි සම්පූර්ණ නාමය තෝරන්න.',
          options: ['Central Processing Unit', 'Computer Power Unit', 'Central Program Unit', 'Control Processing Unit'],
          correctAnswer: 'Central Processing Unit',
          explanation: 'CPU යනු Central Processing Unit සඳහා වූ සංක්ෂේපයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which device is used to point and click on the screen?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct peripheral device.',
      options: ['Printer', 'Keyboard', 'Mouse', 'Monitor'],
      correctAnswer: 'Mouse',
      explanation: 'A mouse is used to move the pointer and click on the screen.',
      translations: {
        Tamil: {
          title: 'திரையில் குறிக்கவும் கிளிக் செய்வதற்கு எந்த கருவி பயன்படுத்தப்படுகிறது?',
          body: 'சரியான peripheral கருவியை தேர்வு செய்யவும்.',
          options: ['பிரிண்டர்', 'கீபோர்டு', 'தவளை', 'மானிட்டர்'],
          correctAnswer: 'தவளை',
          explanation: 'தவளை புள்ளியை நகர்த்தவும் திரையில் கிளிக் செய்யவும் பயன்படுகிறது.'
        },
        Sinhala: {
          title: 'තිරයේ පිහිටි දේවල් නැරඹීමට සහ ක්ලික් කිරීමට භාවිතා කරන උපාංගය කුමක්ද?',
          body: 'නිවැරදි කර්මික උපාංගය තෝරන්න.',
          options: ['මුද්‍රකය', 'කීබෝර්ඩ්', 'මවුස්', 'මානිතරය'],
          correctAnswer: 'Mouse',
          explanation: 'මවුස් මඟින් පින්තූරය පහසුවෙන් ගෙන යා හැකි අතර තිරයට ක්ලික් කළ හැක.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which software would you use to write a letter?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the best type of application.',
      options: ['Web browser', 'Word processor', 'Spreadsheet', 'Calculator'],
      correctAnswer: 'Word processor',
      explanation: 'A word processor is used to write letters and documents.',
      translations: {
        Tamil: {
          title: 'கடிதம் எழுத எந்த மென்பொருளை நீங்கள் பயன்படுத்துவீர்கள்?',
          body: 'சிறந்த பயன்பாட்டு வகையை தேர்வு செய்யவும்.',
          options: ['வெப் உலாவி', 'வேர்ட் செயலி', 'ஸ்பிரெட் ஷீட்', 'கணினி'],
          correctAnswer: 'வேர்ட் செயலி',
          explanation: 'கடிதங்களையும் ஆவணங்களையும் எழுத வேர்ட் செயலி பயன்படுத்தப்படுகிறது.'
        },
        Sinhala: {
          title: 'පත්‍රයක් ලියීමට ඔබ යොදා ගන්නා මෘදුකාංගය කුමක්ද?',
          body: 'සුදුසුම යෙදුම තෝරන්න.',
          options: ['වෙබ් බ්‍රවුසරය', 'වර්ඩ් ප්‍රොසෙසර්', 'ප්‍රකරණ පත', 'ගණනයකරු'],
          correctAnswer: 'Word processor',
          explanation: 'වර්ඩ් ප්‍රොසෙසරය ලිපි සහ ලේඛන ලියීමට භාවිතා වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the main role of the operating system?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the correct operating system role.',
      options: ['Translate languages', 'Manage hardware and software', 'Create spreadsheets', 'Draw pictures'],
      correctAnswer: 'Manage hardware and software',
      explanation: 'The operating system controls hardware and runs software.',
      translations: {
        Tamil: {
          title: 'ஆபரேட்டிங் சிஸ்டத்தின் முக்கியப் பங்கு என்ன?',
          body: 'ஆபரேட்டிங் சிஸ்டத்தின் சரியான வகையை தேர்வு செய்யவும்.',
          options: ['மொழிகளை மொழிபெயர்க்க', 'ஹார்ட்வேர் மற்றும் மென்பொருளை நிர்வகிக்க', 'ஸ்பிரெட் ஷீடுகளை உருவாக்க', 'படங்களை வரைய'],
          correctAnswer: 'ஹார்ட்வேர் மற்றும் மென்பொருளை நிர்வகிக்க',
          explanation: 'ஆபரேட்டிங் சிஸ்டம் ஹார்ட்வேர் ஐ கட்டுப்படுத்து மென்பொருளை இயக்குகிறது.'
        },
        Sinhala: {
          title: 'ඔපරේටින් පද්ධතියේ ප්‍රධාන කාර්යය කුමක්ද?',
          body: 'නිවැරදි ප්‍රධාන කාර්යය තෝරන්න.',
          options: ['භාෂා පරිවර්තනය', 'හාර්ඩ්වේයාර් සහ මෘදුකාංග කළමනාකරණය', 'ප්‍රවෘත්ත පතක් නිර්මාණය', 'පින්තූර ඇඳීම'],
          correctAnswer: 'Manage hardware and software',
          explanation: 'ඔපරේටින් පද්ධතිය හාර්ඩ්වේයාර් පාලනය කරයි සහ මෘදුකාංග ක්‍රියාත්මක කරයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which device stores data permanently?',
      difficulty: 'Hard',
      points: 10,
      body: 'Select the correct storage device.',
      options: ['RAM', 'Hard disk', 'Keyboard', 'Monitor'],
      correctAnswer: 'Hard disk',
      explanation: 'A hard disk keeps data when the computer is switched off.',
      translations: {
        Tamil: {
          title: 'எந்த கருவி தரவை நிரந்தரமாக சேமிக்கிறது?',
          body: 'சரியான சேமிப்பு கருவியை தேர்வு செய்யவும்.',
          options: ['RAM', 'ஹார்டு டிஸ்க்', 'கீபோர்டு', 'மானிட்டர்'],
          correctAnswer: 'ஹார்டு டிஸ்க்',
          explanation: 'கணினி ஆக்செசாக் பிட்டு அடைப்பு செய்யப்பட்டபோது தரவு சேமிக்க ஹார்டு டிஸ்க் பயன்படுகிறது.'
        },
        Sinhala: {
          title: 'දත්ත ස්ථිරවම ගබඩා කරන උපාංගය කුමක්ද?',
          body: 'නිවැරදි ගබඩා උපාංගය තෝරන්න.',
          options: ['RAM', 'හාර්ඩ් ඩිස්ක්', 'කීබෝර්ඩ්', 'මානිතරය'],
          correctAnswer: 'Hard disk',
          explanation: 'පරිගණකය වසා දැමූ විට දත්ත රඳවා තබන්නේ හාර්ඩ් ඩිස්ක් සහනයයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe how antivirus software protects a computer.',
      difficulty: 'Medium',
      points: 10,
      body: 'Explain how antivirus software detects and removes threats.',
      correctAnswer: 'Antivirus software scans files, compares them with known threats, and removes or isolates suspicious programs.',
      explanation: 'A good answer explains scanning, threat detection, quarantine, and updates.',
      translations: {
        Tamil: {
          title: 'ஆன்டிவைரஸ் மென்பொருள் கணினியை எப்படி பாதுகாக்கிறது என்பதை விவரிக்கவும்.',
          body: 'ஆன்டிவைரஸ் மென்பொருள் எவ்வாறு மிழிகளை கண்டறிந்து அகற்றுகிறது என்பதை விளக்கவும்.',
          correctAnswer: 'ஆன்டிவைரஸ் மென்பொருள் கோப்புகளை ஸ்கேன் செய்து, அறிந்த அச்சுறுத்தல்களுடன் ஒப்பிட்டு, சந்தேகமான திட்டங்களை அகற்றுகிறது அல்லது தனிமைப்படுத்துகிறது.',
          explanation: 'நல்ல பதில் ஸ்கேன், அச்சுறுத்தல் கண்டறிதல், தனிமை மற்றும் புதுப்பிப்புகளை விளக்க வேண்டும்.'
        },
        Sinhala: {
          title: 'ඇන්ටිවයිරස් මෘදුකාංගය පරිගණකය ආරක්ෂා කරන්නේ කෙසේද?',
          body: 'ඇන්ටිවයිරස් මෘදුකාංගය තර්ජන හඳුනා ගෙන ඉවත් කරන්නේ කෙසේද යන්න түс කර ගන්න.',
          correctAnswer: 'ඇන්ටිවයිරස් මෘදුකාංගය ගොනු පරීක්ෂා කරයි, පද්ධතියේ හඳුනාගත් තර්ජන සමඟ එය සැසඳේ, සහ සැකසුණු වැඩසටහන් ඉවත් හෝ වෙන් කරයි.',
          explanation: 'හොඳ පිළිතුර ස්කෑනිං, තර්ජන හඳුනා ගැනීම, කැරකිරීම සහ යාවත්කාලීන කිරීම සදහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why a strong password is important.',
      difficulty: 'Medium',
      points: 10,
      body: 'Write why strong passwords help protect information.',
      correctAnswer: 'Strong passwords make accounts harder to break and help keep personal information safe from hackers.',
      explanation: 'A strong answer mentions security, privacy, and reducing hacking risk.',
      translations: {
        Tamil: {
          title: 'வலுவான கடவுச்சொல் ஏன் முக்கியம்?',
          body: 'தகவலை பாதுகாக்க வலுவான கடவுச்சொற்கள் எவ்வாறு உதவுகின்றன என்பதை எழுது.',
          correctAnswer: 'வலுவான கடவுச்சொற்கள் கணக்குகளை உடைக்க கடினமாகவும் ஹேக்கர்களிலிருந்து தனிப்பட்ட தகவலை பாதுகாக்கவும் உதவுகின்றன.',
          explanation: 'பலவீனம், தனியுரிமை மற்றும் ஹேக்கிங் ஆபத்தை குறைப்பதை குறிப்பிடும் பதிலை எழுது.'
        },
        Sinhala: {
          title: 'ශක්තිමත් මුරපදයක් ඇයි වැදගත්ද?',
          body: 'ශක්තිමත් මුරපද තොරතුරු ආරක්ෂණයට කෙසේ උපකාරීද කියන්න.',
          correctAnswer: 'ශක්තිමත් මුරපද ගිණුම් විනාශ කිරීම දුෂ්කර කරයි සහ පුද්ගලික තොරතුරු හකිංගෙන් ආරක්ෂා කරයි.',
          explanation: 'හොඳ පිළිතුර ආරක්ෂාව, පෞද්ගලිකත්වය සහ හකිං අවදානම අඩු කිරීම සදහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe how the internet helps students learn.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain the benefits of using the internet for school learning.',
      correctAnswer: 'The internet gives students access to information, videos, online books, and tools that help with research and studying.',
      explanation: 'A strong answer mentions information access, research, and educational resources.',
      translations: {
        Tamil: {
          title: 'இணையம் மாணவர்களுக்கு எப்படி உதவுகிறது என்பதை விவரிக்கவும்.',
          body: 'பள்ளி கற்றலுக்காக இணையத்தை பயன்படுத்துவதன் நன்மைகள் என்ன என்பதை விளக்கவும்.',
          correctAnswer: 'இணையம் மாணவர்களுக்கு தகவல், வீடியோக்கள், ஆன்லைன் புத்தகங்கள் மற்றும் ஆராய்ச்சி மற்றும் படிப்பிற்கு உதவும் கருவிகளை கிடைக்கச் செய்கிறது.',
          explanation: 'நல்ல பதில் தகவல் அணுகல், ஆராய்ச்சி மற்றும் கல்வி வளங்களை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'අන්තර්ජාලය සිසුන්ට ඉගෙනීමට කොහොමද උදව් කරනවාද කියා විස්තර කරන්න.',
          body: 'පාසල් ඉගෙනුම් සඳහා අන්තර්ජාලය භාවිතයෙහි ප්‍රයෝජන පැහැදිලි කරන්න.',
          correctAnswer: 'අන්තර්ජාලය සිසුන්ට තොරතුරු, වීඩියෝ, ඔන්ලයින් පොත් සහ පර්යේෂණ සහ අධ්‍යයන උදව්වන් ලබා දෙයි.',
          explanation: 'ශක්තිමත් පිළිතුර තොරතුරු ප්‍රවේශය, පර්යේෂණ සහ අධ්‍යාපන සම්පත් ගැන සඳහන් කළ යුතුය.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Sinhala', [
    {
      type: 'mcq',
      title: 'Which Sinhala proverb means "bad work leads to bad results"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct Sinhala proverb meaning.',
      options: [
        'කම්මැලියනේ හොඳක් නැත',
        'අපූරු දේවල් සතුට',
        'උත්සාහය අසාර්ථකයි',
        'නරක කම්කරු නරක යි'
      ],
      correctAnswer: 'නරක කම්කරු නරක යි',
      explanation: 'This proverb means that bad work leads to bad results.',
      translations: {
        Sinhala: {
          title: '“නරක වැඩ කරන්නේ නම් නරක ප්‍රතිඵල ලැබේ” යන සිංහල පදවිමුව තෝරන්න.',
          body: 'නිවැරදි සිංහල පදවිමුව තෝරන්න.',
          options: [
            'කම්මැලියනේ හොඳක් නැත',
            'අපූරු දේවල් සතුට',
            'උත්සාහය අසාර්ථකයි',
            'නරක කම්කරු නරක යි'
          ],
          correctAnswer: 'නරක කම්කරු නරක යි',
          explanation: 'මෙම පදවිමුව නරක වැඩකිරීම නරක ප්‍රතිඵල වලට හේතු වන බව කියයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the Sinhala word for "book"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct Sinhala translation for book.',
      options: ['පොත', 'සෙරෙප්ප', 'ගෙඩිය', 'කඩේ'],
      correctAnswer: 'පොත',
      explanation: 'පොත means book in Sinhala.',
      translations: {
        Sinhala: {
          title: '“පොත” සඳහා සිංහල වචනය කුමක්ද?',
          body: 'පොතට නිවැරදි සිංහල වචනය තෝරන්න.',
          options: ['පොත', 'සෙරෙප්ප', 'ගෙඩිය', 'කඩේ'],
          correctAnswer: 'පොත',
          explanation: 'පොත යනු සිංහලෙන් “book” යි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which Sinhala word means "river"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct Sinhala word for river.',
      options: ['කදුලු', 'නදී', 'පෘථිවී', 'ඔටුනු'],
      correctAnswer: 'නදී',
      explanation: 'නදී means river.',
      translations: {
        Sinhala: {
          title: '“river” සඳහා සිංහල වචනය කුමක්ද?',
          body: 'නදී සඳහා නිවැරදි සිංහල වචනය තෝරන්න.',
          options: ['කදුලු', 'නදී', 'පෘථිවී', 'ඔටුනු'],
          correctAnswer: 'නදී',
          explanation: 'නදී යනු සිංහලෙන් “river” යි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the correct Sinhala greeting for "Good morning"?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the appropriate Sinhala greeting.',
      options: ['සුභ උදෑසනක්', 'සුභ රාත්‍රියක්', 'සුභ දවසක්', 'සුභ සවසක්'],
      correctAnswer: 'සුභ උදෑසනක්',
      explanation: 'සුභ උදෑසනක් means good morning.',
      translations: {
        Sinhala: {
          title: '“Good morning” සඳහා නිවැරදි සිංහල ආදරය කුමක්ද?',
          body: 'නිවැරදි සිංහල සුභ ආදරය තෝරන්න.',
          options: ['සුභ උදෑසනක්', 'සුභ රාත්‍රියක්', 'සුභ දවසක්', 'සුභ සවසක්'],
          correctAnswer: 'සුභ උදෑසනක්',
          explanation: 'සුභ උදෑසනක් යනු “Good morning” යි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which word means "teacher" in Sinhala?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct Sinhala word.',
      options: ['ගුරු', 'ස්කෝලිය', 'ශාෂක', 'පියතුම'],
      correctAnswer: 'ගුරු',
      explanation: 'ගුරු means teacher in Sinhala.',
      translations: {
        Sinhala: {
          title: '“teacher” සඳහා සිංහල වචනය කුමක්ද?',
          body: 'නිවැරදි සිංහල වචනය තෝරන්න.',
          options: ['ගුරු', 'ස්කෝලිය', 'ශාෂක', 'පියතුම'],
          correctAnswer: 'ගුරු',
          explanation: 'ගුරු යනු සිංහලෙන් “teacher” යි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why Vesak is important to Sri Lankan culture.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write a short response about the cultural importance of Vesak.',
      correctAnswer: 'Vesak is important because it celebrates the birth, enlightenment, and passing of the Buddha, and it brings people together for acts of kindness, meditation, and cultural traditions.',
      explanation: 'A strong answer should mention religious significance, community celebrations, and values like compassion.',
      translations: {
        Sinhala: {
          title: 'වෙසක් මංගල්‍යය ශ්‍රී ලංකාවේ සංස්කෘතියට ඇයි වැදගත්ද කියා පැහැදිලි කරන්න.',
          body: 'වෙසක් සංස්කෘතික වැදගත්කම ගැන කෙටි පිළිතුරක් ලියන්න.',
          correctAnswer: 'වෙසක් සම්ප්‍රදායිකව බුද්ධජනයන්ගේ උපන් දිනය, බුද්ධත්වය සහ පැවැත්ම සැමරීමට, කරුණාව, භාවනාව සහ සංස්කෘතික රීති සමඟ ජනතාව එකට රැස් කිරීමට වැදගත් වේ.',
          explanation: 'හොඳ පිළිතුරක් ආගම්මය වැදගත්කම, ජනසම්මන්ධන සහ භාවනාව වැනි වටිනාකම් සදහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe the importance of preserving the Sinhala language.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain why maintaining your mother tongue is valuable.',
      correctAnswer: 'Preserving Sinhala is valuable because it protects local literature, culture, identity, and communication across generations.',
      explanation: 'Good answers include language, culture, literature, and community identity.',
      translations: {
        Sinhala: {
          title: 'සිංහල භාෂාව සංරක්ෂණය කිරීමේ වැදගත්කම විස්තර කරන්න.',
          body: 'ඔබේ මවු භාෂාව තබා ගැනීමේ වටිනාකම පැහැදිලි කරන්න.',
          correctAnswer: 'සිංහල භාෂාව රැක ගැනීම වටිනාකමයි, එය දේශීය සාහිත්‍යය, සංස්කෘතිය, හැඳුනුම සහ පරම්පරාවන් අතර සන්නිවේදනය ආරක්ෂා කරයි.',
          explanation: 'හොඳ පිළිතුර භාෂාව, සංස්කෘතිය, සාහිත්‍යය සහ ප්‍රජා හැඳුනුම සඳහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain the meaning of a Sinhala proverb in your own words.',
      difficulty: 'Hard',
      points: 15,
      body: 'Pick a Sinhala proverb and describe what it teaches.',
      correctAnswer: 'A Sinhala proverb teaches life lessons about hard work, kindness, or patience, and the answer should explain the lesson clearly.',
      explanation: 'A strong answer includes the proverb meaning and how it applies to daily life.',
      translations: {
        Sinhala: {
          title: 'සිංහල පදවිමුවක අරුත ඔබේ වචන වලින් පැහැදිලි කරන්න.',
          body: 'සිංහල පදවිමුවක් තෝරා එහි දැනුම විස්තර කරන්න.',
          correctAnswer: 'සිංහල පදවිමුවක් වැඩ සහන, කරුණාව හෝ කල්පනාධාරීත්වය ගැන ජීවන පාඩම් ඉගන්වයි, සහ පිළිතුර බාහිරව පැහැදිලි කළ යුතුය.',
          explanation: 'හොඳ පිළිතුර පදවිමුවේ අරුත සහ එය දෛනික ජීවිතයට හැඳින්වීම පහදා දිය යුතුය.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Tamil', [
    {
      type: 'mcq',
      title: 'What is the Tamil word for "teacher"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct Tamil word used for a teacher.',
      options: ['மாணவன்', 'ஆசிரியர்', 'கோயில்', 'நண்பர்'],
      correctAnswer: 'ஆசிரியர்',
      explanation: 'ஆசிரியர் (aasiriyar) means teacher in Tamil.',
      translations: {
        Tamil: {
          title: 'ஆசிரியருக்கான தமிழ் வார்த்தை எது?',
          body: 'ஆசிரியை குறிப்பிடும் சரியான தமிழ் வார்த்தையை தேர்வு செய்யவும்.',
          options: ['மாணவன்', 'ஆசிரியர்', 'கோயில்', 'நண்பர்'],
          correctAnswer: 'ஆசிரியர்',
          explanation: 'ஆசிரியர் என்பது மாணவர்களை கற்றுத்தரும் நபரை குறிக்கும் தமிழ் சொல் ஆகும்.'
        },
        Sinhala: {
          title: 'ගුරුවරයෙකු සඳහා தமிழ் වචනය කුමක්ද?',
          body: 'ගුරුවරයෙකු සඳහා නිවැරදි தமிழ் වචනය තෝරන්න.',
          options: ['மாணவன்', 'ஆசிரியர்', 'கோயில்', 'நண்பர்'],
          correctAnswer: 'ஆசிரியர்',
          explanation: 'ஆசிரியர் යනු ගුරුවරයෙකු සඳහා භාවිත කරන தமிழ் වචනයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which Tamil word means "school"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct Tamil translation for school.',
      options: ['பள்ளி', 'மருதம்', 'வயல்கள்', 'இடி'],
      correctAnswer: 'பள்ளி',
      explanation: 'பள்ளி means school.',
      translations: {
        Tamil: {
          title: 'பள்ளிக்கான தமிழ் வார்த்தை எது?',
          body: 'பள்ளியை குறிக்கும் சரியான தமிழ் வார்த்தையை தேர்வு செய்யவும்.',
          options: ['பள்ளி', 'மருதம்', 'வயல்கள்', 'இடி'],
          correctAnswer: 'பள்ளி',
          explanation: 'பள்ளி என்பது கல்வி நிலையத்தை குறிக்கும் தமிழ் சொல் ஆகும்.'
        },
        Sinhala: {
          title: 'පාසල සඳහා தமிழ் වචනය කුමක්ද?',
          body: 'පාසල සඳහා නිවැරදි தமிழ் වචනය තෝරන්න.',
          options: ['பள்ளி', 'மருதம்', 'வயல்கள்', 'இடி'],
          correctAnswer: 'பள்ளி',
          explanation: 'பள்ளி යනු පාසලක් පවසන தமிழ் වචනයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which word means "festival" in Tamil?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the correct Tamil word.',
      options: ['திருவிழா', 'மகிழ்ச்சி', 'இளைஞர்', 'பூங்கா'],
      correctAnswer: 'திருவிழா',
      explanation: 'திருவிழா means festival in Tamil.',
      translations: {
        Tamil: {
          title: 'திருவிழாவுக்கான தமிழ் வார்த்தை எது?',
          body: 'திருவிழாவை குறிக்கும் சரியான தமிழ் வார்த்தையை தேர்வு செய்யவும்.',
          options: ['திருவிழா', 'மகிழ்ச்சி', 'இளைஞர்', 'பூங்கா'],
          correctAnswer: 'திருவிழா',
          explanation: 'திருவிழா என்பது சிறப்பு நிகழ்ச்சியை குறிக்கும் தமிழ் சொல் ஆகும்.'
        },
        Sinhala: {
          title: 'உත්சவයක් සඳහා தமிழ் වචනය කුමක්ද?',
          body: 'மஹா උත්සவයට අදාල தமிழ் වචනය තෝரන්න.',
          options: ['திருவிழா', 'மகிழ்ச்சி', 'இளைஞர்', 'பூங்கா'],
          correctAnswer: 'திருவிழா',
          explanation: 'திருவிழா යනු உත්சவයක් පවත්වන தமிழ் වචනයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the Tamil word for "water"?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct Tamil word for water.',
      options: ['நீர்', 'மண்', 'கல்', 'மரம்'],
      correctAnswer: 'நீர்',
      explanation: 'நீர் means water.',
      translations: {
        Tamil: {
          title: 'தண்ணீருக்கான தமிழ் வார்த்தை எது?',
          body: 'தண்ணீரை குறிக்கும் சரியான தமிழ் வார்த்தையை தேர்வு செய்யவும்.',
          options: ['நீர்', 'மண்', 'கல்', 'மரம்'],
          correctAnswer: 'நீர்',
          explanation: 'நீர் என்பது தண்ணீரைக் குறிக்கும் தமிழ் சொல் ஆகும்.'
        },
        Sinhala: {
          title: 'වතුර සඳහා தமிழ் වචනය කුමක්ද?',
          body: 'වතුර සඳහා නිවැරදි தமிழ் වචනය තෝරන්න.',
          options: ['நீர்', 'மண்', 'கல்', 'மரம்'],
          correctAnswer: 'நீர்',
          explanation: 'நீர் යනු වතුරක් පවසන தமிழ் වචනයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which Tamil sentence asks about the weather?',
      difficulty: 'Hard',
      points: 10,
      body: 'Select the sentence that asks about the weather.',
      options: ['நேரம் என்ன?', 'வானிலை எப்படி இருக்கிறது?', 'அவன் கத்துவான்', 'நான் வீடு செல்லுகிறேன்'],
      correctAnswer: 'வானிலை எப்படி இருக்கிறது?',
      explanation: 'This sentence asks “How is the weather?”.',
      translations: {
        Tamil: {
          title: 'வானிலை பற்றி கேட்கும் தமிழ் வாக்கியம் எது?',
          body: 'வானிலை பற்றி கேட்கும் வாக்கியத்தை தேர்வு செய்யவும்.',
          options: ['நேரம் என்ன?', 'வானிலை எப்படி இருக்கிறது?', 'அவன் கத்துவான்', 'நான் வீடு செல்லுகிறேன்'],
          correctAnswer: 'வானிலை எப்படி இருக்கிறது?',
          explanation: 'இந்த வாக்கியம் "வானிலை எப்படி இருக்கிறது?" என்று கேட்கிறது.'
        },
        Sinhala: {
          title: 'අසළ කාලගුණය ගැන අසන தமிழ் වාක්‍යය කුමක්ද?',
          body: 'කාලගුණය ගැන අසන වාක්‍යය තෝරන්න.',
          options: ['நேரம் என்ன?', 'வானிலை எப்படி இருக்கிறது?', 'அவன் கத்துவான்', 'நான் வீடு செல்லுகிறேன்'],
          correctAnswer: 'வானிலை எப்படி இருக்கிறது?',
          explanation: 'මෙම වාක්‍යය "උදේ කාලගුණය කොහොමද?" කියා අසයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain the importance of learning Tamil for cultural harmony.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write a short response about why studying Tamil helps society.',
      correctAnswer: 'Learning Tamil helps maintain cultural heritage, improves communication, and builds respect between communities.',
      explanation: 'A strong answer mentions culture, respect, and community understanding.',
      translations: {
        Tamil: {
          title: 'கலாச்சார ஒற்றுமைக்காக தமிழ் கற்றல் முக்கியத்துவம் என்ன?',
          body: 'தமிழ் படிப்பது சமூதாயத்திற்கு எப்படி உதவுகிறது என்பதைச் சொல்க.',
          correctAnswer: 'தமிழ் கற்றல் கலாச்சார மரபை பாதுகாக்க உதவுகிறது, தொடர்பை மேம்படுத்துகிறது மற்றும் சமூகங்களுக்கு இடையே மரியாதையை உருவாக்குகிறது.',
          explanation: 'நல்ல பதில் கலாச்சாரம், மரியாதை மற்றும் சமூக புரிதலை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'සංස්කෘතික ඒකාබද්ධතාවය සඳහා தமிழ் ඉගෙනීමේ වැදගත්කම පැහැදිලි කරන්න.',
          body: 'தமிழ் படிப்பது சமூதாயයට எப்படி உதவுகிறது என்பது பற்றி எழுதவும்.',
          correctAnswer: 'தமிழ் கற்றல் பண்பாட்டு மரபை பாதுகாக்க உதவுகிறது, தொடர்பை மேம்படுத்துகிறது மற்றும் சமூகங்களுக்கு இடையே மரியாதையை உருவாக்குகிறது.',
          explanation: 'சரி பதில் கலாச்சாரம், மரியாதை மற்றும் சமூக புரிதலை குறிப்பிடும்.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe a Tamil festival and how it is celebrated.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write a paragraph about a Tamil celebration and its traditions.',
      correctAnswer: 'A Tamil festival like Pongal is celebrated by cooking a special rice dish, giving thanks for the harvest, and sharing gifts with family.',
      explanation: 'Good answers explain the festival name, traditions, food, and family activities.',
      translations: {
        Tamil: {
          title: 'ஒரு தமிழ் திருவிழாவைப் பற்றி மற்றும் அது எப்படி கொண்டாடப்படுகிறது என்று விவரிக்கவும்.',
          body: 'ஒரு தமிழ் திருவிழாவை மற்றும் அதன் பாரம்பரியங்களைக் குறித்து ஒரு பத்தி எழுதவும்.',
          correctAnswer: 'பொங்கலோடு போன்ற தமிழ் திருவிழா ஒரு சிறப்பு சாதம் செய்து, அறுவடைக்கு நன்றி கூறி, குடும்பத்தாருடன் பரிசுகள் பகிர்ந்துகொண்டு கொண்டாடப்படுகிறது.',
          explanation: 'நன்றாக பதிலை திருவிழை பெயர், மரபுகள், உணவு மற்றும் குடும்ப நிகழ்வுகளை விளக்க வேண்டும்.'
        },
        Sinhala: {
          title: 'ஒரு தமிழ் උත්සවයක් மற்றும் அது எப்படி கொண்டாடப்படுகிறது என்று விவரியுங்கள்.',
          body: 'ஒரு தமிழ் උත්සවය மற்றும் அதன் பழங்கால රීති ගැන ලිපියක් எழுதන්න.',
          correctAnswer: 'பொங்கல் போன்று தமிழ் උත්සවයක් சிறப்பு சாதம் செய்து, அறுவடைට ස්තූතියි தெரிவித்து, குடும்ப සමඟ තෑගි බෙදා හදාගෙන සමරයි.',
          explanation: 'හොඳ පිළිතුර උත්සවයේ නාමය, පැරණි රීති, ආහාර සහ පවුල් ක්‍රියාකාරකම් පැහැදිලි කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why stories are important in Tamil culture.',
      difficulty: 'Hard',
      points: 15,
      body: 'Describe why stories and folklore matter in Tamil life.',
      correctAnswer: 'Stories teach lessons, keep traditions alive, and help people remember their history and values.',
      explanation: 'A strong answer mentions teaching, culture, and memory.',
      translations: {
        Tamil: {
          title: 'தமிழ் கலாச்சாரத்தில் கதைகள் முக்கியமானதற்கான காரணம் என்ன?',
          body: 'தமிழ் வாழ்க்கையில் கதைகள் மற்றும் புராணங்கள் ஏன் முக்கியம் என்பதை விளக்கவும்.',
          correctAnswer: 'கதைகள் பாடங்களை கற்பிக்கின்றன, மரபுகளை உயிர்ப்பிக்கின்றன, மற்றும் மக்கள் தங்கள் வரலாறு மற்றும் மதிப்புகளை நினைவில் வைத்துக்கொள்ள உதவுகின்றன.',
          explanation: 'சிறந்த பதில் கல்வி, கலாச்சாரம் மற்றும் நினைவுபத்திரத்தை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'தமிழ் සංස්කෘතියේ කතා වැදගත් වන්නේ ඇයි?',
          body: 'தமிழ் ජීවිතයේ කතා සහ පුරන්සිංහලක් මතු වන අතර එය ප්‍රමාණවත් ද යන්න විස්තර කරන්න.',
          correctAnswer: 'කතා පාඩම් දෙනවා, සම්ප්‍රදාය ජීවිතය රැක ගනී, සහ ජනතාවට ඔවුන්ගේ ඉතිහාසය සහ වටිනාකම් මතක තබා ගැනීමට උදව් කරනවා.',
          explanation: 'හොඳ පිළිතුරක් අධ්‍යාපනය, සංස්කෘතිය සහ මතකය සඳහන් කළ යුතුය.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'English Language', [
    {
      type: 'mcq',
      title: 'Choose the correct sentence.',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the sentence with correct grammar.',
      options: [
        'She dont like mangoes.',
        'They is going to school.',
        'He has finished his homework.',
        'I am go to the market.'
      ],
      correctAnswer: 'He has finished his homework.',
      explanation: 'This sentence uses correct subject-verb agreement.',
      translations: {
        Sinhala: {
          title: 'නිවැරදි වාක්‍යය තෝරන්න.',
          body: 'නිවැරදි ව්‍යාකරණය සහිත වාක්‍යය තෝරන්න.',
          correctAnswer: 'He has finished his homework.',
          explanation: 'මෙම වාක්‍යය විෂය-ක්‍රියා සමානතාවය සහිත ව්‍යාකරණයක් භාවිත කරයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the plural of "child"?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct plural form.',
      options: ['Childs', 'Children', 'Childes', 'Childen'],
      correctAnswer: 'Children',
      explanation: 'The plural of child is children.',
      translations: {
        Sinhala: {
          title: '“child” සඳහා බහු වචනය කුමක්ද?',
          body: 'නිවැරදි බහු වචනය තෝරන්න.',
          correctAnswer: 'Children',
          explanation: 'child හි බහු වචනය children යි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which word is an adjective?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the word that describes a noun.',
      options: ['Run', 'Beautiful', 'Quickly', 'Happily'],
      correctAnswer: 'Beautiful',
      explanation: 'Beautiful is an adjective.',
      translations: {
        Sinhala: {
          title: 'යුක්තියක් දක්වන වචනය කුමක්ද?',
          body: 'නාම පදයක් විස්තර කරන වචනය තෝරන්න.',
          correctAnswer: 'Beautiful',
          explanation: 'Beautiful යනු විශේෂණයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Choose the correct form: "They ___ playing."',
      difficulty: 'Medium',
      points: 8,
      body: 'Fill in the blank with the correct verb form.',
      options: ['is', 'are', 'am', 'was'],
      correctAnswer: 'are',
      explanation: 'The correct form is "They are playing."',
      translations: {
        Sinhala: {
          title: '“They ___ playing.” සඳහා නිවැරදි ආකාරය තෝරන්න.',
          body: 'නිවැරදි ක්‍රියා පද ආකාරය පිරවන්න.',
          correctAnswer: 'are',
          explanation: 'නිවැරදි වාක්‍යය “They are playing.” වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which sentence is in the past tense?',
      difficulty: 'Hard',
      points: 10,
      body: 'Select the sentence that describes a past event.',
      options: ['She will travel tomorrow.', 'He is reading a book.', 'They watched a movie last night.', 'I am walking to school.'],
      correctAnswer: 'They watched a movie last night.',
      explanation: 'The sentence uses the past tense verb watched.',
      translations: {
        Sinhala: {
          title: 'කෝණක වාක්‍යය භූත කාලයට සම්බන්ද වේද?',
          body: 'ගත වූ සිදුවීමක් විස්තර කරන වාක්‍යය තෝරන්න.',
          correctAnswer: 'They watched a movie last night.',
          explanation: 'මෙම වාක්‍යය watched යන භූත කාල ක්‍රියාපදය භාවිත කරයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Write a short paragraph about your favorite hobby.',
      difficulty: 'Medium',
      points: 10,
      body: 'Describe your hobby and explain why you enjoy it.',
      correctAnswer: 'A good paragraph describes the hobby, when you do it, and why it is enjoyable or important to you.',
      explanation: 'Strong answers include details about the hobby and personal reasons for liking it.',
      translations: {
        Sinhala: {
          title: 'ඔබේ ප්‍රියතම හොබිය ගැන කෙටි පද්‍යයක් ලියන්න.',
          body: 'ඔබගේ හොබිය විස්තර කර එය ඔබට ඇයි ප්‍රීතියක් දක්වන්නේද කියන්න.',
          correctAnswer: 'A good paragraph describes the hobby, when you do it, and why it is enjoyable or important to you.',
          explanation: 'හොඳ පිළිතුරක් සෑම විස්තරයක්ම සහ ඔබට එය ඇයි වැදගත්ද යන්න සඳහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain how good reading habits help learning.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write a response that explains the benefits of reading regularly.',
      correctAnswer: 'Good reading habits improve vocabulary, concentration, and knowledge, making it easier to learn new subjects.',
      explanation: 'The answer should mention reading, vocabulary, focus, and how it supports study.',
      translations: {
        Sinhala: {
          title: 'හොඳ කියවීමේ පුරුදු ඉගෙනුම්ට කෙසේ උදව් කරනවාද පැහැදිලි කරන්න.',
          body: 'නිතිපතා කියවීමේ වාසි සඳහන් කළ යුතු පිළිතුරක් ලියන්න.',
          correctAnswer: 'Good reading habits improve vocabulary, concentration, and knowledge, making it easier to learn new subjects.',
          explanation: 'පිළිතුරේ කියවීම, වචන කෝෂය, අවධානය සහ අධ්‍යයනයට සහය දක්වන ආකාරය සඳහන් කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe a memorable school day and why it was special.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about a school event that you remember well.',
      correctAnswer: 'A memorable school day includes clear details about the event, how you felt, and why it was important.',
      explanation: 'Strong answers include event details, feelings, and what made it special.',
      translations: {
        Sinhala: {
          title: 'සිහින මතක පාසල් දිනයක් විස්තර කරන්න.',
          body: 'ඔබට හොඳින් මතක ඇති පාසල් සිද්ධියක් ගැන ලියන්න.',
          correctAnswer: 'A memorable school day includes clear details about the event, how you felt, and why it was important.',
          explanation: 'හොඳ පිළිතුරක් සිදුවීමේ විස්තර, ඔබට ඇති හැඟීම් සහ එය විශේෂ කළ හේතුව සඳහන් කළ යුතුය.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Mathematics', [
    {
      type: 'mcq',
      title: 'What is 12 × 7?',
      difficulty: 'Easy',
      points: 5,
      body: 'Calculate the multiplication value.',
      options: ['72', '70', '84', '64'],
      correctAnswer: '84',
      explanation: '12 multiplied by 7 equals 84.',
      translations: {
        Tamil: {
          title: '12 × 7 என்பது என்ன?',
          body: 'பெருக்கத்தை கணக்கிடுங்கள்.',
          options: ['72', '70', '84', '64'],
          correctAnswer: '84',
          explanation: '12 ஐ 7 கொண்டு பெருக்கினால் 84 கிடைக்கிறது.'
        },
        Sinhala: {
          title: '12 × 7 කීයද?',
          body: 'ගුණනයේ අගය ගණනය කරන්න.',
          options: ['72', '70', '84', '64'],
          correctAnswer: '84',
          explanation: '12 ක් 7 එකට ගුණ කළහොත් 84 වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the perimeter of a rectangle with sides 5 cm and 8 cm?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct perimeter.',
      options: ['13 cm', '26 cm', '40 cm', '20 cm'],
      correctAnswer: '26 cm',
      explanation: 'Perimeter = 2 × (5 + 8) = 26 cm.',
      translations: {
        Tamil: {
          title: 'பக்கங்கள் 5 செ.மீ மற்றும் 8 செ.மீ உள்ள சதுரத்தின் பரப்பளவு  என்ன?',
          body: 'சரியான பரப்பளவை தேர்வு செய்யவும்.',
          options: ['13 செ.மீ', '26 செ.மீ', '40 செ.மீ', '20 செ.மீ'],
          correctAnswer: '26 செ.மீ',
          explanation: 'Perimeter = 2 × (5 + 8) = 26 செ.மீ.'
        },
        Sinhala: {
          title: 'පසසු 5 සෙ.මී. සහ 8 සෙ.මී. ඇති හතරැස්කයාගේ පරිමාව කීයද?',
          body: 'නිවැරදි පරිමාව තෝරන්න.',
          options: ['13 සෙ.මී.', '26 සෙ.මී.', '40 සෙ.මී.', '20 සෙ.මී.'],
          correctAnswer: '26 cm',
          explanation: 'පජ්‍රෝමය = 2 × (5 + 8) = 26 සෙ.මී.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is 25% of 200?',
      difficulty: 'Medium',
      points: 8,
      body: 'Find the percentage value.',
      options: ['25', '50', '75', '100'],
      correctAnswer: '50',
      explanation: '25% of 200 is 50.',
      translations: {
        Tamil: {
          title: '200 இன் 25% என்பது என்ன?',
          body: 'சதவீத மதிப்பை கண்டுபிடிக்கவும்.',
          options: ['25', '50', '75', '100'],
          correctAnswer: '50',
          explanation: '200 இன் 25% 50 ஆகும்.'
        },
        Sinhala: {
          title: '200 හි 25% කීයද?',
          body: 'ශත අගය සොයන්න.',
          options: ['25', '50', '75', '100'],
          correctAnswer: '50',
          explanation: '200 හි 25% වන්නේ 50යි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which fraction is equal to 0.5?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the equivalent fraction.',
      options: ['1/3', '1/2', '2/5', '3/4'],
      correctAnswer: '1/2',
      explanation: '0.5 is equal to one-half.',
      translations: {
        Tamil: {
          title: '0.5 க்குச் சமம் ஆன பகுதி எது?',
          body: 'சமமான பகுதியை தேர்ந்தெடுக்கவும்.',
          options: ['1/3', '1/2', '2/5', '3/4'],
          correctAnswer: '1/2',
          explanation: '0.5 என்பது ஒரு பாதிக்கு சமம்.'
        },
        Sinhala: {
          title: '0.5 ට සමාන කොටස කුමක්ද?',
          body: 'සමාන කොටස තෝරන්න.',
          options: ['1/3', '1/2', '2/5', '3/4'],
          correctAnswer: '1/2',
          explanation: '0.5 යනු අඩක් හෝ ය.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which shape has four equal sides and four right angles?',
      difficulty: 'Hard',
      points: 10,
      body: 'Choose the correct geometric shape.',
      options: ['Rectangle', 'Square', 'Rhombus', 'Parallelogram'],
      correctAnswer: 'Square',
      explanation: 'A square has all sides equal and all angles right angles.',
      translations: {
        Tamil: {
          title: 'நான்கு சமமான பக்கங்களும் நான்கு சரியான கோணங்களும் உள்ள வடிவம் எது?',
          body: 'சரியான ஜியோமெட்ரிக் வடிவத்தை தேர்வு செய்யவும்.',
          options: ['நேர்கோணம்', 'சதுரம்', 'ரம்பஸ்', 'பாரலலோகிராம்'],
          correctAnswer: 'சதுரம்',
          explanation: 'சதுரத்திற்கு அனைத்து பக்கங்களும் சமம் மற்றும் அனைத்து கோணங்களும் சரியான கோணங்கள் உள்ளன.'
        },
        Sinhala: {
          title: 'සමාන හතර පැත්ත සහ හතරම නිවැරදි කෝණ ඇති හැඩය කුමක්ද?',
          body: 'නිවැරදි ජ්‍යෙතිතික හැඩය තෝරන්න.',
          options: ['අවතලය', 'වරර', 'රොම්බස්', 'සහලෝව කොටස'],
          correctAnswer: 'Square',
          explanation: 'වර්ගයකට සමාන සියලු පැත්ත හා සෑම කෝණයක්ම නිවැරදි කෝණයක් වේ.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain how to find the area of a triangle.',
      difficulty: 'Medium',
      points: 10,
      body: 'Write the formula and describe how to use it.',
      correctAnswer: 'The area of a triangle is 1/2 × base × height. Multiply the base length by the height and divide by two.',
      explanation: 'A good answer explains the formula and the role of base and height.',
      translations: {
        Tamil: {
          title: 'முக்கோணத்தின் பரப்பை கண்டுபிடிப்பது எப்படி என்பதை விளக்கவும்.',
          body: 'சூத்திரத்தை எழுதி அதை எவ்வாறு பயன்படுத்துவது என்பதை விளக்கவும்.',
          correctAnswer: 'முக்கோணத்தின் பரப்பு = 1/2 × அடிப்படை × உயரம். அடிப்படை நீளத்தை உயரத்துடன் பெருக்கி இரண்டு ஆகப் பிரிக்கவும்.',
          explanation: 'நல்ல பதில் சூத்திரத்தையும் அடிப்படை மற்றும் உயரத்தின் பங்கையும் விளக்க வேண்டும்.'
        },
        Sinhala: {
          title: 'තුනකෝණයක ප්‍රදේශය හඳුනා ගැනීමට කෙසේද?',
          body: 'සූත්‍රය ලියමින් එය භාවිතා කෙරෙන හැටි විස්තර කරන්න.',
          correctAnswer: 'තුනකෝණයේ ප්‍රදේශය = 1/2 × පදය × උස. පදයේ දිග උසට ගුණ කර අතරින් දෙකෙන් කොටන්න.',
          explanation: 'හොඳ පිළිතුර සූත්‍රය සහ පදය හා උසගේ භූමිකාව පැහැදිලි කළ යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe how to solve a two-step algebra problem.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain the process of solving a simple equation with two steps.',
      correctAnswer: 'First simplify both sides, then isolate the unknown by reversing operations step by step.',
      explanation: 'Strong answers mention simplifying, using inverse operations, and checking the solution.',
      translations: {
        Tamil: {
          title: 'இரு படிகளைக் கொண்ட ஆல்ஜீப்ரா பிரச்சினையை எப்படி தீர்க்கலாம் என்பதைக் குறிப்பிடவும்.',
          body: 'இரண்டு படிகளுடன் ஒரு எளிய சமன்பாட்டை தீர்க்கும் செயல்முறையை விளக்கவும்.',
          correctAnswer: 'முதலில் இரு பக்கங்களையும் எளிமைப்படுத்தி, பின்னர் எதிர்மறை செயல்களின் மூலம் bilin unknown ஐ தனித்து விடவும்.',
          explanation: 'பின்விளைவுகள், எதிர்மறை செயல்பாடுகள் மற்றும் தீர்வைச் சரிபார்ப்பதை குறிப்பிடுவது வலுவான பதிலாகும்.'
        },
        Sinhala: {
          title: 'දෙදෙනා පියවරක සරල ආල්ජීබ්‍රා ගැටළුවක් කෙසේ විසඳන්නේද?',
          body: 'දෙපියවරක් සහිත සමානතාවයක් විසඳන ක්‍රියාවලිය විස්තර කරන්න.',
          correctAnswer: 'පළමුව දෙපැත්තම සරළ කරන්න, පසුව ප්‍රති ක්‍රියාකාරී ක්‍රියාකාරකම් පියවරෙන් සෝදා නොදත් අගය වෙනත් වෙත සමීප කරන්න.',
          explanation: 'වලස සරල කිරීම, ප්‍රති ක්‍රියාකාරකම් භාවිතය, සහ විසඳුම පිරික්සීම සදහන් කළ යුතුයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe how to compare two fractions.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain how to tell which fraction is larger.',
      correctAnswer: 'To compare fractions, make the denominators the same or convert both to decimals and then compare the values.',
      explanation: 'A good answer mentions finding common denominators or changing fractions to decimals.',
      translations: {
        Tamil: {
          title: 'இரண்டு பகுதியைக் எப்படி ஒப்பிடுவது என்பதை விளக்கவும்.',
          body: 'யார் பெரிய பகுதி என்பதை கூற எப்படி செய்வது என்று விளக்கவும்.',
          correctAnswer: 'பகுதிகளை ஒப்பிட, பின்அளவிமான பொருட்களை ஒரே மாதிரி செய்யலாம் அல்லது இரண்டு பகுதியையும் தசமமாக மாற்றி மதிப்புகளை ஒப்பிடலாம்.',
          explanation: 'ஒரே பகுதியினரைக் காண்பது அல்லது பகுதியை தசமமாக மாற்றுவது என்று குறிப்பிடுவது நல்ல பதிலாகும்.'
        },
        Sinhala: {
          title: 'දෙපැත්තක් කොහොමද අනුපාත වශයෙන් සසඳන්නේ?',
          body: 'ලොකු කොටස හඳුනාගැනීමට කරුණු පැහැදිලි කරන්න.',
          correctAnswer: 'අනුපාත සසඳන විට හේතුක අංශක එකට හෝ දෙපැත්ත දශම සංඛ්‍යා ලෙස පරිවර්තනය කරන්න.',
          explanation: 'හොඳ පිළිතුර ප්‍රමාණ සමාන කිරීම හෝ දශම සංඛ්‍යා ලෙස පරිවර්තනය කිරීමේ ක්‍රමය සදහන් කළ යුතුයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Science', [
    {
      type: 'mcq',
      title: 'What process do plants use to make food?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct scientific process.',
      options: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'],
      correctAnswer: 'Photosynthesis',
      explanation: 'Plants make food through photosynthesis using sunlight, water, and carbon dioxide.',
      translations: {
        Tamil: {
          title: 'இறுக்கியவை என்ன செயல்முறை மூலம் உணவு தயாரிக்கின்றன?',
          body: 'சரியான அறிவியல் செயல்முறையை தேர்வு செய்யவும்.',
          options: ['உயிர்ப்பியல்', 'புகையூற்று', 'உணவுப் படிப்பு', 'மஞ்சள் நீராவியம்'],
          correctAnswer: 'புகையூற்று',
          explanation: 'இறுக்கியவை வெள்ளிருள், நீர் மற்றும் கார்பன் டையாக்சைடு மூலம் புகையூற்றின் மூலம் உணவை தயாரிக்கின்றன.'
        },
        Sinhala: {
          title: 'සසන් ආහාරය සකස් කිරීමට භාවිතා කරන ක්‍රියාවලිය කුමක්ද?',
          body: 'නිවැරදි විද්‍යාත්මක ක්‍රියාවලිය තෝරන්න.',
          options: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'],
          correctAnswer: 'Photosynthesis',
          explanation: 'සසන් සූර්ය ආලෝකය, ජලය සහ වායුගෝලීය CO2 භාවිතයෙන් photosynthesis මගින් ආහාරය නිපදවාගනී.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which organ pumps blood through the body?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct organ.',
      options: ['Lungs', 'Brain', 'Heart', 'Stomach'],
      correctAnswer: 'Heart',
      explanation: 'The heart pumps blood through the circulatory system.',
      translations: {
        Tamil: {
          title: 'எந்த உறுப்புவே ரத்தத்தை உடலில் முழுவதும் தருகிறது?',
          body: 'சரியான உறுப்பை தேர்வு செய்க.',
          options: ['உள்வாயு', 'மதம்', 'இதயம்', 'குடல்'],
          correctAnswer: 'இதயம்',
          explanation: 'இதயம் ரத்தத்தை சுழற்சி மண்டலமுழுவதும் தருகிறது.'
        },
        Sinhala: {
          title: 'ශරීරය හරහා රුධිරය තල්ලු කරන අවයවය කුමක්ද?',
          body: 'නිවැරදි අවයවය තෝරන්න.',
          options: ['Lungs', 'Brain', 'Heart', 'Stomach'],
          correctAnswer: 'Heart',
          explanation: 'හදවත රුධිරය පටලය හරහා පහලවනුයේ හදවතයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What state of matter has a fixed shape and volume?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the correct state of matter.',
      options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
      correctAnswer: 'Solid',
      explanation: 'A solid has a fixed shape and volume.',
      translations: {
        Tamil: {
          title: 'நிலையான வடிவமும் அளவுமுடைய பொருள் நிலையம் எது?',
          body: 'சரியான பொருள் நிலையத்தை தேர்வு செய்யவும்.',
          options: ['திட', 'திரவம்', 'வாயு', 'பிளாஸ்மா'],
          correctAnswer: 'திட',
          explanation: 'திட பொருள் நிலையான வடிவத்தையும் அளவையும் கொண்டுள்ளது.'
        },
        Sinhala: {
          title: 'ස්ථිර හැඩයක් සහ පරිමාවක් ඇති ද්‍රව්‍ය තත්ත්වය කුමක්ද?',
          body: 'නිවැරදි ද්‍රව්‍ය තත්ත්වය තෝරන්න.',
          options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
          correctAnswer: 'Solid',
          explanation: 'දෘඩ ද්‍රව්‍යයකට ස්ථිර හැඩයක් සහ පරිමාවක් ඇත.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which gas do humans breathe in to survive?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the gas required for respiration.',
      options: ['Nitrogen', 'Carbon dioxide', 'Oxygen', 'Hydrogen'],
      correctAnswer: 'Oxygen',
      explanation: 'Humans need oxygen for respiration.',
      translations: {
        Tamil: {
          title: 'மனிதர்கள் உயிர்வாழ எதனை வாயுவை சுவாசிக்கின்றனர்?',
          body: 'உயிர்வாழ்வுக்கு தேவையான வாயுவை தேர்வு செய்க.',
          options: ['நைட்ரஜன்', 'கார்பன் டையாக்சைடு', 'ஆக்ஸிஜன்', 'ஹைட்ரஜன்'],
          correctAnswer: 'ஆக்ஸிஜன்',
          explanation: 'மனிதர்கள் உயிர்வாழ்விற்காக ஆக்ஸிஜன் தேவைப்படுகின்றது.'
        },
        Sinhala: {
          title: 'මනුෂ්‍යයන් ජීවත් වීමට ඇද ගන්නා වායුව කුමක්ද?',
          body: 'ජීවත්වීමට අවශ්‍ය වායුව තෝරන්න.',
          options: ['Nitrogen', 'Carbon dioxide', 'Oxygen', 'Hydrogen'],
          correctAnswer: 'Oxygen',
          explanation: 'මිනිසුන්ට සාමාන්‍යේ ජීවිතයක් සඳහා ඔක්සිජන් අවශ්‍ය වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which part of a plant takes in water from the soil?',
      difficulty: 'Hard',
      points: 10,
      body: 'Choose the correct plant part.',
      options: ['Leaf', 'Stem', 'Root', 'Flower'],
      correctAnswer: 'Root',
      explanation: 'Roots absorb water and nutrients from the soil.',
      translations: {
        Tamil: {
          title: 'மண் இருந்து தண்ணீரை உறிஞ்சும் தாவரப் பகுதி எது?',
          body: 'சரியான தாவரப் பகுதியை தேர்வு செய்யவும்.',
          options: ['இலை', 'தண்டு', 'வேர்', 'மலர்'],
          correctAnswer: 'வேர்',
          explanation: 'வேர் தண்ணீரையும் ஊட்டச்சத்தினையும் மண்ணிலிருந்து உறிஞ்சுகிறது.'
        },
        Sinhala: {
          title: 'ගස්වලින් ඉරිතලා ජලය අංශයට ගන්නා කොටස කුමක්ද?',
          body: 'නිවැරදි ශාක කොටස තෝරන්න.',
          options: ['Leaf', 'Stem', 'Root', 'Flower'],
          correctAnswer: 'Root',
          explanation: 'වැට මඟින් ජලය සහ පෝෂක ද්‍රව්‍ය මට්ටමට සෝදිසි කරයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe the water cycle in simple terms.',
      difficulty: 'Medium',
      points: 10,
      body: 'Explain evaporation, condensation, and precipitation.',
      correctAnswer: 'The water cycle moves water from oceans and lakes into the air by evaporation, forms clouds by condensation, and returns rain through precipitation.',
      explanation: 'A good answer mentions the three main stages and how water moves between them.',
      translations: {
        Tamil: {
          title: 'தண்ணீர் சுற்றுப்பாதையை எளிமையான வார்த்தைகளில் விவரிக்கவும்.',
          body: 'வெப்பவியக்கம், கமந்சன்சேஷன் மற்றும் மழை பெய்தல் பற்றி விளக்கவும்.',
          correctAnswer: 'தண்ணீர் சுற்றுப்பாதை கடலிலிருந்து மற்றும் ஏரிகளிலிருந்து நீரைக் வெப்பவியக்கத்தின் மூலம் வாயுவாக மாற்றி, கமந்சன்சேஷன் மூலம் மேகங்களாக மாற்றி, மழை பெய்தல் மூலம் மீண்டும் தரைக்கு திரும்புகிறது.',
          explanation: 'நல்ல பதில் மூன்று முக்கிய நிலைகளையும் நீர் எப்படி நகர்கிறது என்பதையும் குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'ජල චක්‍රය සරල වචන වලින් විස්තර කරන්න.',
          body: 'විනිමය, සංයෝජනය සහ වර්ෂාපතනය පැහැදිලි කරන්න.',
          correctAnswer: 'ජල චක්‍රය සාගර හා වැව වලින් ජලය වියාපාරයට ගෙන යයි, වාසනාවෙන් වලාකුළු තැනී, වර්ෂාපතනයෙන් වතුර නැවත ලොවට හැරයි.',
          explanation: 'හොඳ පිළිතුර තුන් ප්‍රධාන අදියර සහ ජලය ඒවා අතර කෙසේ ගමන් කරනවාද යන්න සඳහන් කරයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why balanced nutrition is important for students.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write a short response about the benefits of eating a balanced diet.',
      correctAnswer: 'Balanced nutrition gives students energy, helps growth, and improves concentration and overall health.',
      explanation: 'Strong responses mention energy, growth, learning, and staying healthy.',
      translations: {
        Tamil: {
          title: 'மாணவர்களுக்காக சமநிலை உணவு ஏன் முக்கியம் என்று விளக்கவும்.',
          body: 'சமநிலை உணவு சாப்பிடுவதன் நன்மைகள் பற்றி ஒரு சுருக்கமான பதிலை எழுது.',
          correctAnswer: 'சமநிலை உட்கார்தல் மாணவர்களுக்கு சக்தி கொடுக்கிறது, வளர்ச்சிக்கு உதவுகிறது, கவனத்தையும் மொத்த ஆரோக்கியத்தையும் மேம்படுத்துகிறது.',
          explanation: 'மிகச்சிறந்த பதில் சக்தி, வளர்ச்சி, கற்றல் மற்றும் ஆரோக்கியத்தை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'සමබර පෝෂණය μαθητέςවලට ඇයි වැදගත්ද කියා පැහැදිලි කරන්න.',
          body: 'සමබර ආහාරයක් ගැන කෙටි පිළිතුරක් ලියන්න.',
          correctAnswer: 'සමබර පෝෂණය μαθητέςවලට ශක්තිය, වර්ධනය, අවධානය හා සෞඛ්‍යය වර්ධනය කිරීමට උදව් කරනවා.',
          explanation: 'හොඳ පිළිතුර ශක්තිය, වර්ධනය, ඉගෙනුම සහ සෞඛ්‍යය සඳහන් කළ යුතුයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe why exercise helps the body stay healthy.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain the benefits of regular physical activity for students.',
      correctAnswer: 'Exercise strengthens muscles, improves the heart, and helps students stay energetic and focused.',
      explanation: 'A strong answer mentions fitness, energy, and wellbeing.',
      translations: {
        Tamil: {
          title: 'உடற்பயிற்சி உடலை ஆரோக்கியமாக வைத்திருப்பதற்கு எப்படி உதவுகிறது என்பதை விவரிக்கவும்.',
          body: 'மாணவர்களுக்கு தவிர்ப்பற்ற உடற்பயிற்சியின் நன்மைகளை விளக்கவும்.',
          correctAnswer: 'உடற்பயிற்சி தசைகளை வலுப்படுத்துகிறது, இதய செயல்பாட்டை மேம்படுத்துகிறது, மற்றும் மாணவர்கள் உற்சாகமாகவும் கவனமாகவும் இருக்க உதவுகிறது.',
          explanation: 'வலுவான பதில் உடல்நலம், சக்தி மற்றும் நலத்தை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'උපරිම ශාරීරික ක්‍රියාකාරකම් නිසා ශරීරය කෙසේ සුවපත් වෙයිද කියා පැහැදිලි කරන්න.',
          body: 'මිනිසුන්ට නිතරවම ව්‍යායාම කළ යුතු වාසියන් ගැන ලියන්න.',
          correctAnswer: 'Exercise strengthens muscles, improves the heart, and helps students stay energetic and focused.',
          explanation: 'ශක්තිය, ශක්තිමත් සෞඛ්‍යය සහ ජීවිත ගුණාත්මක භාවය ගැන සඳහන් කළ යුතුය.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'History', [
    {
      type: 'mcq',
      title: 'Which site in Sri Lanka is a UNESCO World Heritage Site?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct Sri Lankan heritage site.',
      options: ['Kandy Lake', 'Sigiriya', 'Galle Clock Tower', 'Independence Square'],
      correctAnswer: 'Sigiriya',
      explanation: 'Sigiriya is a UNESCO World Heritage Site in Sri Lanka.',
      translations: {
        Tamil: {
          title: 'இலங்கையில் எந்த இடம் யுனெஸ்கோ உலக பாரம்பரியத் தளமாகும்?',
          body: 'இலங்கையின் சரியான பாரம்பரிய இடத்தைத் தேர்வு செய்யவும்.',
          options: ['கண்டி ஏரி', 'சிகிரி', 'காலி கடிகாரக் கோபுரம்', 'சுதந்திர சதுரம்'],
          correctAnswer: 'சிகிரி',
          explanation: 'சிகிரி இலங்கையில் யுனெஸ்கோ உலக பாரம்பரியத் தளமாகும்.'
        },
        Sinhala: {
          title: 'ශ්‍රී ලංකාවේ යුනෙස්කෝ ලෝක උරුම තatanaය කුමක්ද?',
          body: 'නිවැරදි ශ්‍රී ලංකා උරුම ස්ථානය තෝරන්න.',
          options: ['Kandy Lake', 'Sigiriya', 'Galle Clock Tower', 'Independence Square'],
          correctAnswer: 'Sigiriya',
          explanation: 'සිගිරිය ශ්‍රී ලංකාවේ යුනෙස්කෝ ලෝක උරුම තatanaයක් වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Who was a famous Sri Lankan king of the ancient period?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct ancient ruler.',
      options: ['Vijaya', 'Dutugemunu', 'Raja', 'Parakramabahu'],
      correctAnswer: 'Dutugemunu',
      explanation: 'King Dutugemunu is a famous ancient ruler of Sri Lanka.',
      translations: {
        Tamil: {
          title: 'பண்டைய கால இலங்கை அரசர்களில் புகழ்பெற்றவர் யார்?',
          body: 'சரியான பண்டைய அதிகாரியைத் தேர்வு செய்யவும்.',
          options: ['விஜயா', 'துதுகெமுனு', 'ராஜா', 'பிரக்ரமபாகு'],
          correctAnswer: 'துதுகெமுனு',
          explanation: 'துதுகெமுனு இலங்கையின் புகழ்பெற்ற பண்டைய அரசராகும்.'
        },
        Sinhala: {
          title: 'පුරාතන යුගයේ ශ්‍රී ලංකාවෙහි ප්‍රසිද්ධ රජු කවුද?',
          body: 'නිවැරදි පුරාතන රජුන් තෝරන්න.',
          options: ['Vijaya', 'Dutugemunu', 'Raja', 'Parakramabahu'],
          correctAnswer: 'Dutugemunu',
          explanation: 'දුටුගැමුණු ශ්‍රී ලංකාවේ ප්‍රසිද්ධ පුරාතන රජුන් අතරට අයත් වේ.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the capital city of Sri Lanka?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct capital.',
      options: ['Colombo', 'Kandy', 'Jaffna', 'Galle'],
      correctAnswer: 'Colombo',
      explanation: 'Colombo is the commercial capital of Sri Lanka.',
      translations: {
        Tamil: {
          title: 'இலங்கையின் தலைநகரம் எது?',
          body: 'சரியான தலைநகரத்தைத் தேர்ந்தெடுக்கவும்.',
          options: ['கொழும்பு', 'கண்டி', 'யாழ்ப்பாணம்', 'காலி'],
          correctAnswer: 'கொழும்பு',
          explanation: 'கொழும்பு இலங்கையின் வர்த்தக தலைநகரமாகும்.'
        },
        Sinhala: {
          title: 'ශ්‍රී ලංකාවේ අගනගරය කුමක්ද?',
          body: 'නිවැරදි අගනගරය තෝරන්න.',
          options: ['Colombo', 'Kandy', 'Jaffna', 'Galle'],
          correctAnswer: 'Colombo',
          explanation: 'කොළඹ ශ්‍රී ලංකාවේ වෙළඳ අගනගරයයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why preserving historical sites is important.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about the value of protecting history for future generations.',
      correctAnswer: 'Preserving historical sites keeps the past alive, teaches about culture, and helps future generations learn from history.',
      explanation: 'A strong answer mentions education, culture, and heritage.',
      translations: {
        Tamil: {
          title: 'வரலாற்று இடங்களை பாதுகாக்கப்படுவது ஏன் முக்கியம்?',
          body: 'எதிர்கால தலைமுறைகளுக்காக வரலாற்றை பாதுகாப்பதின் மதிப்பு பற்றி எழுதவும்.',
          correctAnswer: 'வரலாற்று இடங்களை பாதுகாப்பது கடந்த காலத்தை உயிருடன் வைத்திருக்க உதவுகிறது, பண்பாட்டை கற்றுக்கொடுக்கிறது மற்றும் எதிர்கால தலைமுறைகள் வரலாற்று அனுபவத்திலிருந்து கற்றுக் கொள்ள உதவுகிறது.',
          explanation: 'நல்ல பதில் கல்வி, பண்பாடு மற்றும் பரம்பரை குறித்து குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'ඉතිහාසමය ස්ථාන රැක ගැනීම වැදගත් වන්නේ ඇයි?',
          body: 'එවා අනාගත පරපුරට පුරාතනය රැක ගැනීමේ කුමන වටිනාකමක් ඇතැයි ලියන්න.',
          correctAnswer: 'ඉතිහාසමය ස්ථාන රැක ගැනීම අතීතය ජීවත්වන්නා කරයි, සංස්කෘතියක් ගැන උගන්වයි, සහ අනාගත පරම්පරවරුන්ට ඉතිහාසයෙන් ඉගෙනගැනීමට උදව් කරයි.',
          explanation: 'හොඳ පිළිතුර අධ්‍යාපනය, සංස්කෘතිය සහ උරුමය පිළිබඳව දක්වයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe the role of ancient kings in Sri Lankan history.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain how ancient kings shaped Sri Lanka.',
      correctAnswer: 'Ancient kings built cities, protected the island, and created irrigation systems that helped people live and farm.',
      explanation: 'A good answer mentions leadership, protection, and public works.',
      translations: {
        Tamil: {
          title: 'இலங்கையின் வரலாற்றில் பண்டைய அரசர்களின் பங்கு என்ன?',
          body: 'பண்டைய அரசர்கள் இலங்கையை எப்படி வடிவமைத்தார்கள் என்பது பற்றி விளக்கவும்.',
          correctAnswer: 'பண்டைய அரசர்கள் நகரங்களை கட்டினர், தீவினை பாதுகாத்தனர், மற்றும் மக்களுக்கு வாழவும் வேளாண் செய்யவும் உதவும் நீர்ப்பணிகளை உருவாக்கினர்.',
          explanation: 'நல்ல பதில் தலைமை, பாதுகாப்பு மற்றும் பொதுப் பணிகளை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'ශ්‍රී ලංකාවේ ඉතිහාසේ පුරාතන රජුන්ගේ භූමිකාව විස්තර කරන්න.',
          body: 'පුරාතන රජුන් ශ්‍රී ලංකාව කොහොමද හැඩගස්වා තිබේද කියා පැහැදිලි කරන්න.',
          correctAnswer: 'පුරාතන රජුන් නගර ගොඩනගා, දූපත ආරක්ෂා කර, ජීවත්වීමට සහ වගාවට උදව් කරන නාය පද්ධති නිර්මාණය කළා.',
          explanation: 'හොඳ පිළිතුර නායකත්වය, ආරක්ෂාව සහ මහජන වැඩ කටයුතු ගැන කියයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Geography', [
    {
      type: 'mcq',
      title: 'Which ocean surrounds Sri Lanka?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct ocean.',
      options: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'],
      correctAnswer: 'Indian Ocean',
      explanation: 'Sri Lanka is located in the Indian Ocean.',
      translations: {
        Tamil: {
          title: 'இலங்கையை சுற்றி இருக்கும் பெருங்கடல் எது?',
          body: 'சரியான பெருங்கடலை தேர்வு செய்யவும்.',
          options: ['அட்லாண்டிக் பெருங்கடல்', 'பசிபிக் பெருங்கடல்', 'இந்தியப் பெருங்கடல்', 'அரக்டிக் பெருங்கடல்'],
          correctAnswer: 'இந்தியப் பெருங்கடல்',
          explanation: 'இலங்கை இந்தியப் பெருங்கடலில் அமைந்துள்ளது.'
        },
        Sinhala: {
          title: 'ශ්‍රී ලංකාව වටා පිහිටා තිබෙන සාගරය කුමක්ද?',
          body: 'නිවැරදි සාගරය තෝරන්න.',
          options: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'],
          correctAnswer: 'Indian Ocean',
          explanation: 'ශ්‍රී ලංකාව ඉන්දියානු සාගරයේ පිහිටා ඇත.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the capital of Sri Lanka?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct capital city.',
      options: ['Colombo', 'Kandy', 'Galle', 'Jaffna'],
      correctAnswer: 'Colombo',
      explanation: 'Colombo is the commercial capital of Sri Lanka.',
      translations: {
        Tamil: {
          title: 'இலங்கையின் தலைநகரம் எது?',
          body: 'சரியான தலைநகரை தேர்வு செய்யவும்.',
          options: ['கொழும்பு', 'கண்டி', 'காலி', 'யாழ்ப்பாணம்'],
          correctAnswer: 'கொழும்பு',
          explanation: 'கொழும்பு இலங்கையின் வர்த்தக தலைநகராகும்.'
        },
        Sinhala: {
          title: 'ශ්‍රී ලංකාවේ අගනගරය කුමක්ද?',
          body: 'නිවැරදි අගනගරය තෝරන්න.',
          options: ['Colombo', 'Kandy', 'Galle', 'Jaffna'],
          correctAnswer: 'Colombo',
          explanation: 'කොළඹ ශ්‍රී ලංකාවේ වෙළඳ අගනගරයයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which direction is north on most maps?',
      difficulty: 'Medium',
      points: 8,
      body: 'Choose the correct map direction.',
      options: ['Up', 'Down', 'Left', 'Right'],
      correctAnswer: 'Up',
      explanation: 'Most maps show north at the top.',
      translations: {
        Tamil: {
          title: 'பெரும்பாலான வரைபடங்களில் வடக்கு எந்த திசையில் உள்ளது?',
          body: 'சரியான வரைபட திசையை தேர்வு செய்யவும்.',
          options: ['மேல்', 'கீழ்', 'இடது', 'வலது'],
          correctAnswer: 'மேல்',
          explanation: 'பெரும்பாலான வரைபடங்களில் வடக்கு மேலே காட்டப்படுகிறது.'
        },
        Sinhala: {
          title: 'බොහෝ සිතියම්වල උතුරු දිශාව කොහෙද?',
          body: 'නිවැරදි සිතියම් දිශාව තෝරන්න.',
          options: ['Up', 'Down', 'Left', 'Right'],
          correctAnswer: 'Up',
          explanation: 'බොහෝ සිතියම්වල උතුරු ඉහළින් පෙන්වයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why maps are useful.',
      difficulty: 'Medium',
      points: 10,
      body: 'Write why maps help people find places.',
      correctAnswer: 'Maps show locations, directions, and landmarks so people can navigate safely and plan trips.',
      explanation: 'A strong answer mentions location, direction, and planning.',
      translations: {
        Tamil: {
          title: 'வரைபடங்கள் ஏன் பயன்படும் என்று விளக்கவும்.',
          body: 'வரைபடங்கள் மக்களுக்கு இடங்களை கண்டுபிடிக்க எவ்வாறு உதவுகிறது என்பதை எழுது.',
          correctAnswer: 'வரைபடங்கள் இடங்கள், திசைகள் மற்றும் முக்கிய இடங்களை காட்டுகின்றன, ஆகையால் மக்கள் பாதுகாப்பாக வழிகாட்டி பயணம் திட்டமிடலாம்.',
          explanation: 'வலுவான பதில் இடம், திசை மற்றும் திட்டமிடலை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'සිතියම් කොයි දෙකට ප්‍රයෝජනවත් ද?',
          body: 'සිතියම් මිනිසුන්ට ස්ථාන සොයා ගැනීමට කෙසේ උදව් කරනවාද යන්න ලියන්න.',
          correctAnswer: 'සිතියම් ස්ථාන, දිශානතියන් සහ සලකුණු පෙන්වයි, එමඟින් ජනතාවට ආරක්ෂිතව සංචාර කළ හැක.',
          explanation: 'හොඳ පිළිතුර ස්ථානය, දිශානතිය සහ සැලසුම් කිරීම ගැන සඳහන් කොට යුතුය.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe how people can conserve water.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain actions that save water at home or school.',
      correctAnswer: 'People can save water by fixing leaks, turning off taps, and using less during baths and cleaning.',
      explanation: 'Good answers mention reuse, fixing leaks, and careful water use.',
      translations: {
        Tamil: {
          title: 'மக்கள் தண்ணீரை எப்படி மிச்சப்படுத்த முடியும் என்பதை விவரிக்கவும்.',
          body: 'வீட்டிலும் பள்ளியிலும் தண்ணீரை சேமிக்க எந்த நடவடிக்கைகள் எடுக்கப்படலாம் என்பதை விளக்கவும்.',
          correctAnswer: 'இருகைகளை சரி செய்தல், குழாய்களை அணைத்தல் மற்றும் குளியல் மற்றும் சுத்தம் செய்வதில் குறையாக்கம் செய்வது மூலம் மக்கள் தண்ணீரை மிச்சப்படுத்தலாம்.',
          explanation: 'சரியான பதில் மீண்டும் பயன்பாடு, கழிவுகளை சரி செய்தல் மற்றும் கவனமாக தண்ணீர் பயன்படுத்தலுக்கு குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'මිනිසුන් ජලය කොහොමද සුරක්ෂිත කර ගන්නේ?',
          body: 'නිවසේ හෝ පාසලේ ජලය සුරකින්නට කළ හැකි ක්‍රියාකාරකම් පැහැදිලි කරන්න.',
          correctAnswer: 'අනිවාර්ය තත්වයන් වසා දැමීම, වොෂර් වැවිලි වසා දැමීම හා නාන සහ පිරිසිදු කිරීමට වතුර අඩුවෙන් භාවිත කිරීමෙන් ජලය සුරකින්න පුළුවන්.',
          explanation: 'හොඳ පිළිතුර නැවත භාවිතය, දෝෂ හානි සකස් කිරීම සහ ජලය සැලකිල්ලෙන් භාවිත කිරීම සඳහන් කරනු ඇත.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Civic Education', [
    {
      type: 'mcq',
      title: 'What is one responsibility of a citizen?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct civic responsibility.',
      options: ['Ignore the law', 'Vote in elections', 'Create conflict', 'Avoid community work'],
      correctAnswer: 'Vote in elections',
      explanation: 'Voting is an important citizen responsibility.',
      translations: {
        Tamil: {
          title: 'ஒரு குடிமகனின் பொறுப்பு எது?',
          body: 'சரியான குடியுரிமைப் பொறுப்பை தேர்வு செய்யவும்.',
          options: ['சட்டத்தை புறக்கணிக்க', 'தேர்தல்களில் வாக்களிக்க', 'மோதலை உருவாக்க', 'சமூகப் பணியை தவிர்த்து விட'],
          correctAnswer: 'தேர்தல்களில் வாக்களிக்க',
          explanation: 'வாக்களிப்பது ஒரு முக்கிய குடிமகன் பொறுப்பாகும்.'
        },
        Sinhala: {
          title: 'குடிமகனෙකුගේ பொறுப்பில் ஒன்றெந்தது?',
          body: 'சரியான குடியுரிமைப் பொறுப்பை தேர்வு செய்யவும்.',
          options: ['Ignore the law', 'Vote in elections', 'Create conflict', 'Avoid community work'],
          correctAnswer: 'Vote in elections',
          explanation: 'வாக்கெடுப்பில் கலந்துகொள்வது ஒரு முக்கிய குடிமகன் பொறுப்பாகும்.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What does it mean to show respect?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the right example of respect.',
      options: ['Shouting at others', 'Listening politely', 'Ignoring rules', 'Stealing'],
      correctAnswer: 'Listening politely',
      explanation: 'Respect includes listening and treating others kindly.',
      translations: {
        Tamil: {
          title: 'மரியாதையை காட்டுவது என்பது என்ன?',
          body: 'மரியாதையின் சரியான உதாரணத்தைத் தேர்ந்தெடுக்கவும்.',
          options: ['மற்றவர்களை கத்துவது', 'மெதுவாக கேட்குவது', 'விதிகளை புறக்கணிப்பது', 'திருடுதல்'],
          correctAnswer: 'மெதுவாக கேட்குவது',
          explanation: 'மரியாதையில் கேட்கலும் மற்றும் மற்றவர்களை கவனமாக நடத்துவதும் அடங்கும்.'
        },
        Sinhala: {
          title: 'ගෞරවය පෙන්වන්නේ කෙසේද?',
          body: 'ගෞරවයේ නිවැරදි උදාහරණය තෝරන්න.',
          options: ['Shouting at others', 'Listening politely', 'Ignoring rules', 'Stealing'],
          correctAnswer: 'Listening politely',
          explanation: 'ගෞරවය අන් අයගේ කතා ඇහුම්කරු වීම සහ කරුණාවෙන් සැලසීම අඩංගු වේ.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe what makes a good leader.',
      difficulty: 'Medium',
      points: 10,
      body: 'Explain the qualities of a good leader.',
      correctAnswer: 'A good leader listens, helps others, makes fair decisions, and supports the community.',
      explanation: 'A strong answer mentions fairness, service, and good communication.',
      translations: {
        Tamil: {
          title: 'நன்று தலைவரை உருவாக்குவது என்ன என்பதை விவரிக்கவும்.',
          body: 'ஒரு நல்ல தலைவரின் பண்புகளை விளக்கவும்.',
          correctAnswer: 'ஒரு நல்ல தலைவர் கேட்கும், மற்றவர்களுக்கு உதவுவார், நியாயமான முடிவுகளை எடுப்பார், மற்றும் சமூகத்தை ஆதரிப்பார்.',
          explanation: 'வலுவான பதில் நியாயம், சேவை, மற்றும் நல்ல தொடர்பை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'හොඳ නායකයෙකු සැකසෙන්නේ කෙසේද විස්තර කරන්න.',
          body: 'හොඳ නායකයෙකුගේ ගුණ ගැන පැහැදිලි කරන්න.',
          correctAnswer: 'හොඳ නායකයෙක් ඇහුම්කරු වේ, අන් අයට උදව් කරයි, යුතුකමෙහෙයුම් ගනුදෙනු කරයි, සහ ප්‍රජාව සතුටට පත් කරයි.',
          explanation: 'ශක්තිමත් පිළිතුර යුතුකම, සේවය සහ හොඳ සන්නිවේදනය සඳහන් කරයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why voting matters.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about why citizens should vote.',
      correctAnswer: 'Voting gives people a voice in how the community is run and helps choose leaders who represent their ideas.',
      explanation: 'A good answer mentions choice, representation, and community voice.',
      translations: {
        Tamil: {
          title: 'வாக்களிப்பது ஏன் முக்கியம் என்று விளக்கவும்.',
          body: 'குடிமகன்கள் ஏன் வாக்களிக்க வேண்டும் என்பதைக் குறித்து எழுதவும்.',
          correctAnswer: 'வாக்களிப்பது சமூகத்தை எவ்வாறு இயக்க வேண்டும் என்பதில் மக்களுக்கு குரலைக் கொடுக்கிறது மற்றும் அவர்களின் கருத்துக்களை பிரதிநிதித்துவம் செய்ய கூடிய தலைவர்களை தேர்ந்தெடுக்க உதவுகிறது.',
          explanation: 'சரி பதில் தேர்வு, பிரதிநிதித்துவம் மற்றும் சமூக குரலை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'வாக்குப்பதிவை ஏன் மதிக்க வேண்டும் என்பதைக் குறைக்கவும்.',
          body: 'குடிமகன்கள் ஏன் வாக்களிக்கவேண்டும் என்று எழுதவும்.',
          correctAnswer: 'வாக்குப்பதிவு மக்கள் சமுதாயத்தை எவ்வாறு நடத்துவது என்று கருத்தையினை தெரிவித்துக் கொள்ள உதவுகிறது மற்றும் அவர்களின் கருத்துக்களை பிரதிநிதித்துவம் செய்யும் தலைவர்களை தேர்வுசெய்ய உதவுகிறது.',
          explanation: 'சரி பதில் தேர்வு, பிரதிநிதித்துவம் மற்றும் சமூக குரலை குறிப்பிட வேண்டும்.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Health & Physical Education', [
    {
      type: 'mcq',
      title: 'Which activity helps keep the heart healthy?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the best exercise.',
      options: ['Watching TV', 'Running regularly', 'Sleeping all day', 'Eating junk food'],
      correctAnswer: 'Running regularly',
      explanation: 'Regular running helps the heart stay strong.',
      translations: {
        Tamil: {
          title: 'இதயத்தை ஆரோக்கியமாக வைத்திருக்க எந்த செயல் உதவுகிறது?',
          body: 'சிறந்த உடற்பயிற்சியை தேர்வு செய்யவும்.',
          options: ['தொலைக்காட்சியை பார்க்குதல்', 'முழுநேரமாக ஓடுதல்', 'முழு நாள் தூங்குதல்', 'ஜங்க் உணவு சாப்பிடுதல்'],
          correctAnswer: 'முழுநேரமாக ஓடுதல்',
          explanation: 'தொடர்ச்சியான ஓட்டம் இதயத்தை வலுப்படுத்த உதவுகிறது.'
        },
        Sinhala: {
          title: 'හදවත හොඳින් පවත්වා ගැනීමට කුමන ක්‍රියාවක් උදව් කරනවාද?',
          body: 'හොඳම ව්‍යායාමය තෝරන්න.',
          options: ['Watching TV', 'Running regularly', 'Sleeping all day', 'Eating junk food'],
          correctAnswer: 'Running regularly',
          explanation: 'නිතිපතා ධාවනය කිරීම හදවත සුවදායක කරයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is part of a balanced diet?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the healthy food choice.',
      options: ['Sweets only', 'Vegetables and fruit', 'Only chips', 'Soft drinks'],
      correctAnswer: 'Vegetables and fruit',
      explanation: 'A balanced diet includes vegetables and fruit.',
      translations: {
        Tamil: {
          title: 'சமநிலை உணவின் ஒரு பகுதியாக எது இருக்கிறது?',
          body: 'ஆரோக்கியமான உணவுப் தெரிவை தேர்வு செய்யவும்.',
          options: ['தீனீடுகள் மட்டுமே', 'காய்கறிகள் மற்றும் பழங்கள்', 'சிப்ஸ் மட்டுமே', 'மென்மையான பானங்கள்'],
          correctAnswer: 'காய்கறிகள் மற்றும் பழங்கள்',
          explanation: 'சமமான உணவில் காய்கறிகள் மற்றும் பழங்கள் அடங்கும்.'
        },
        Sinhala: {
          title: 'සමබර ආහාරයක කොටසක් කුමක්ද?',
          body: 'සෞඛ්‍ය සපිරි ආහාරය තෝරන්න.',
          options: ['Sweets only', 'Vegetables and fruit', 'Only chips', 'Soft drinks'],
          correctAnswer: 'Vegetables and fruit',
          explanation: 'සමබර ආහාරයකට එළවලු සහ පළතුරු ඇතුළත් වේ.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe why exercise is important for students.',
      difficulty: 'Medium',
      points: 10,
      body: 'Write about the benefits of physical activity.',
      correctAnswer: 'Exercise gives energy, strengthens muscles, improves mood, and helps students stay focused.',
      explanation: 'A strong answer mentions energy, strength, and better concentration.',
      translations: {
        Tamil: {
          title: 'மாணவர்களுக்கு உடற்பயிற்சி ஏன் முக்கியம் என்று விவரிக்கவும்.',
          body: 'உடல் செயல்பாட்டின் நன்மைகள் பற்றி எழுதவும்.',
          correctAnswer: 'உடற்பயிற்சி சக்தியையும் தசைகளை வலுப்படுத்தியும் மனநிலையையும் மேம்படுத்தியும் மாணவர்கள் கவனமாக இருக்க உதவுகிறது.',
          explanation: 'வலுவான பதில் சக்தி, வலிமை மற்றும் சிறந்த கவனத்தை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'ශිෂ්‍යයන්ට ව්‍යායාමය වැදගත් වන්නේ ඇයි කියා විස්තර කරන්න.',
          body: 'ශාරීරික ක්‍රියාකාරකම් වල වාසියන් ගැන ලියන්න.',
          correctAnswer: 'ව්‍යායාමය ශක්තිය ලබා දේ, පේශි බලගන්වයි, මානසික අවධානය වැඩි කරයි, සහ ශිෂ්‍යයන්ට කේන්ද්‍රගතවීමට උදව් කරනවා.',
          explanation: 'හොඳ පිළිතුර ශක්තිය, වාසිය සහ අවධානය ගැන සඳහන් කරයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain how to stay healthy during the school year.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write tips for staying healthy at school.',
      correctAnswer: 'Students should eat well, exercise, sleep enough, wash hands, and drink water to stay healthy.',
      explanation: 'A good answer includes diet, exercise, rest, and hygiene.',
      translations: {
        Tamil: {
          title: 'பள்ளிப் பருவத்தில் எப்படி ஆரோக்கியமாக இருக்கலாம் என்று விளக்கவும்.',
          body: 'பள்ளியில் ஆரோக்கியமாக இருக்கும் குறிப்புகளை எழுதவும்.',
          correctAnswer: 'மாணவர்கள் நல்ல உணவு சாப்பிட்டு, உடற்பயிற்சி செய்து, போதுமான தூக்கம் எடுத்து, கைகளை கழுவி, நீரை குடித்து ஆரோக்கியமாக இருக்க வேண்டும்.',
          explanation: 'நல்ல பதில் உணவு, உடற்பயிற்சி, ஓய்வு மற்றும் சுகாதாரத்தை உள்ளடக்க வேண்டும்.'
        },
        Sinhala: {
          title: 'පාසල් වර්ෂය තුළ සුවපත් වීමට කෙලෙස ක්‍රියා කරන්නේද කියා ලියන්න.',
          body: 'පාසලේදී සුවපත් වීමට උපදෙස් දක්වන්න.',
          correctAnswer: 'ශිෂ්‍යයන්ට හොඳ ආහාර, ව්‍යායාම, ප්‍රමාණවත් නිදා ගැනීම, අතින් හොඳින් සෝදීම සහ ජලය පීයන එක වැදගත් වේ.',
          explanation: 'හොඳ පිළිතුර ආහාර, ව්‍යායාම, විවේක සහ සෞඛ්‍යය ගැන සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Buddhism', [
    {
      type: 'mcq',
      title: 'Who is the founder of Buddhism?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct religious leader.',
      options: ['Jesus', 'Muhammad', 'Buddha', 'Krishna'],
      correctAnswer: 'Buddha',
      explanation: 'Buddha founded Buddhism.',
      translations: {
        Tamil: {
          title: 'புத்த மதத்தை ஏற்படுத்தியவர் யார்?',
          body: 'சரியான மதத் தலைவரை தேர்வு செய்யவும்.',
          options: ['கிறிஸ்து', 'முஹம்மது', 'புத்தர்', 'கிருஷ்ணர்'],
          correctAnswer: 'புத்தர்',
          explanation: 'புத்தர் புத்த மதத்தை நிறுவினார்.'
        },
        Sinhala: {
          title: 'බුද්ධාගම ආරම්භ කළவர் කව්ද?',
          body: 'නිවැරදි ආගමික නායකයා තෝරන්න.',
          options: ['Jesus', 'Muhammad', 'Buddha', 'Krishna'],
          correctAnswer: 'Buddha',
          explanation: 'බුද්ධන් බුද්ධාගම ආරම්භ කළේය.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which festival celebrates the birth of the Buddha?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct Buddhist festival.',
      options: ['Diwali', 'Vesak', 'Christmas', 'Ramadan'],
      correctAnswer: 'Vesak',
      explanation: 'Vesak celebrates the birth, enlightenment, and passing of Buddha.',
      translations: {
        Tamil: {
          title: 'புத்தரின் பிறப்பினை கொண்டாடும் திருவிழா எது?',
          body: 'சரியான புத்த மத்தியோதிரியை தேர்வு செய்யவும்.',
          options: ['தீபாவளி', 'வெசாக்', 'கிறிஸ்துமஸ்', 'ரமலான்'],
          correctAnswer: 'வெசாக்',
          explanation: 'வெசாக் புத்தரின் பிறப்பு, புத்திமதி மற்றும் இறப்பை கொண்டாடுகிறது.'
        },
        Sinhala: {
          title: 'බුදුන්ගේ ජන්මය සැමරෙන උත්සවය කුමක්ද?',
          body: 'නිවැරදි බුද්ධාගම උත්සවය තෝරන්න.',
          options: ['Diwali', 'Vesak', 'Christmas', 'Ramadan'],
          correctAnswer: 'Vesak',
          explanation: 'වෙසක් බුදුන්ගේ ජන්මය, ආලෝකය සහ පරීක්ෂණය සැමරෙන උත්සවයයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why kindness is important in Buddhism.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about kindness in Buddhist teaching.',
      correctAnswer: 'Kindness helps people live peacefully, reduces harm, and is a key part of Buddhist practice.',
      explanation: 'A strong answer mentions compassion, peace, and good actions.',
      translations: {
        Tamil: {
          title: 'புத்தமதத்தில் கருணை ஏன் முக்கியம் என்பதை விளக்கவும்.',
          body: 'புத்த மத போதனையில் கருணை பற்றி எழுதவும்.',
          correctAnswer: 'கருணை மக்களை அமைதியுடன் வாழ வைக்க உதவுகிறது, தீம் குறைக்க உதவுகிறது, மற்றும் புத்த மத நடைமுறையின் முக்கிய பகுதி.',
          explanation: 'ஒரு வலுவான பதில் கருணை, அமைதி மற்றும் நல்லச் செயல்களை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'බුද්ධාගමට කරුණාව වැදගත් වන්නේ ඇයි කියා විස්තර කරන්න.',
          body: 'බුද්ධාගමික උගන්වීම් වල කරුණාව ගැන ලියන්න.',
          correctAnswer: 'කරුණාව ජනතාවට සාමයෙන් ජීවත් වීමට, හානිය අවම කර ගැනීමට සහ බුද්ධාගම ක්‍රියාවලියේ ප්‍රධාන කොටසක් වීමට උදව් කරයි.',
          explanation: 'හොඳ පිළිතුර සමවීම, සාමය සහ හොඳ ක්‍රියාවන් ගැන සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Hinduism', [
    {
      type: 'mcq',
      title: 'Which festival is celebrated by many Hindus?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the Hindu festival.',
      options: ['Christmas', 'Ramadan', 'Diwali', 'Vesak'],
      correctAnswer: 'Diwali',
      explanation: 'Diwali is a major Hindu festival of lights.',
      translations: {
        Tamil: {
          title: 'பல இந்துக்களால் எந்த திருவிழா கொண்டாடப்படுகிறது?',
          body: 'இந்து திருவிழாவை தேர்வு செய்யவும்.',
          options: ['கிறிஸ்துமஸ்', 'ரமலான்', 'தீபாவளி', 'வெசாக்'],
          correctAnswer: 'தீபாவளி',
          explanation: 'தீபாவளி விளக்குகளால் கொண்டாடப்படும் பெரிய இந்து திருவிழாவாகும்.'
        },
        Sinhala: {
          title: 'බොහෝ හින්දුන් උත්සව කරන උත්සවය කුමක්ද?',
          body: 'හින්දු උත්සවය තෝරන්න.',
          options: ['Christmas', 'Ramadan', 'Diwali', 'Vesak'],
          correctAnswer: 'Diwali',
          explanation: 'தீபாவளி வெළලු උත්සවයක් වන අතර හින්දු උත්සවයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which place is used for Hindu worship?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the correct place of worship.',
      options: ['Mosque', 'Church', 'Temple', 'Pagoda'],
      correctAnswer: 'Temple',
      explanation: 'Hindus worship in temples.',
      translations: {
        Tamil: {
          title: 'இந்துக்கள் வழிபாடு செய்வதற்கான இடம் எது?',
          body: 'சரியான வழிபாடு இடத்தை தேர்வு செய்யவும்.',
          options: ['பள்ளிவாசல்', 'சாலை', 'கோயில்', 'பகோடா'],
          correctAnswer: 'கோயில்',
          explanation: 'இந்துக்கள் கோயில்களில் வழிபடுகிறார்கள்.'
        },
        Sinhala: {
          title: 'හින්දුයන්ට යුතුව දැක්මක් ඇසුරින් පූජා කරන ස්ථානය කුමක්ද?',
          body: 'නිවැරදි පූජා ස්ථානය තෝරන්න.',
          options: ['Mosque', 'Church', 'Temple', 'Pagoda'],
          correctAnswer: 'Temple',
          explanation: 'හින්දුයෝ සිදු කරනවා අග්‍රාල් ශෝභා පූජා කිරීමට.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe the role of prayer in Hindu life.',
      difficulty: 'Hard',
      points: 15,
      body: 'Explain why prayer is important for Hindus.',
      correctAnswer: 'Prayer helps Hindus show gratitude, ask for blessings, and feel connected with their gods.',
      explanation: 'A strong answer mentions gratitude, worship, and spiritual connection.',
      translations: {
        Tamil: {
          title: 'இந்து வாழ்க்கையில் பிரார்த்தனையின் பங்கு என்ன?',
          body: 'இந்துக்களுக்கு பிரார்த்தனை ஏன் முக்கியம் என்பதை விளக்கவும்.',
          correctAnswer: 'பிரார்த்தனை இந்துக்களுக்கு நன்றியை வெளிப்படுத்தவும், அருளைப் பெறவும், தங்கள் கடவுளுடன் தொடர்பாக உணர உதவுகிறது.',
          explanation: 'நன்றியுணர்வு, வழிபாடு மற்றும் ஆன்மீக தொடர்பை குறிப்பிடுவது ஒரு வலுவான பதிலை உருவாக்கும்.'
        },
        Sinhala: {
          title: 'හින්දු ජීවිතයේ ප්‍රාර්ථනා භූමිකාව විස්තර කරන්න.',
          body: 'නිතර ප්‍රාර්ථනා කිරීම හින්දුන්ට ඇයි වැදගත්ද කියා සටහන් කරන්න.',
          correctAnswer: 'ප්‍රාර්ථනා කිරීම හින්දුන්ට කෘතඥතාව පෙන්වීමට, ආශිර්වාද ලබීමට සහ දෙවියන් සමඟ සම්බන්ධව ගැඹුරට හැගීමට උදව් කරයි.',
          explanation: 'හොඳ පිළිතුර කෘතඥතාව, පූජාව සහ ආධ්‍යාත්මික සම්බන්ධතාවය වේ.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Islam', [
    {
      type: 'mcq',
      title: 'What is the holy book of Islam?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct holy book.',
      options: ['Bible', 'Quran', 'Vedas', 'Torah'],
      correctAnswer: 'Quran',
      explanation: 'The Quran is the holy book of Islam.',
      translations: {
        Tamil: {
          title: 'இஸ்லாமில் பரிசுத்த நூல் எது?',
          body: 'சரியான பரிசுத்த நூலை தேர்வு செய்யவும்.',
          options: ['பைபிள்', 'குர்ஆன்', 'வேதங்கள்', 'தோறா'],
          correctAnswer: 'குர்ஆன்',
          explanation: 'குர்ஆன் இஸ்லாமின் பரிசுத்த நூலாகும்.'
        },
        Sinhala: {
          title: 'இஸ்லாமின் பரிசுத்த நூல் කුමක්ද?',
          body: 'නිවැරදි பரிசுத்த நூலை තේර்வන්න.',
          options: ['Bible', 'Quran', 'Vedas', 'Torah'],
          correctAnswer: 'Quran',
          explanation: 'குர்ஆன் இஸ்லாமின் பரிசுத்த நூலாகும்.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which month do Muslims fast from sunrise to sunset?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct Islamic month.',
      options: ['Shawwal', 'Muharram', 'Ramadan', 'Dhul Hijjah'],
      correctAnswer: 'Ramadan',
      explanation: 'Ramadan is the month of fasting for Muslims.',
      translations: {
        Tamil: {
          title: 'முஸ்லீம்கள் எது மாதத்தில் விடியலிலிருந்து சூரியன் மறையும் வரை நோன்பு வைப்பார்கள்?',
          body: 'சரியான இஸ்லாமிய மாதத்தை தேர்வு செய்யவும்.',
          options: ['ஷவ்அல்', 'முஹர்ரம்', 'ரமலான்', 'துல்ஹிஜ்ஜா'],
          correctAnswer: 'ரமலான்',
          explanation: 'ரமலான் முஸ்லீம்களுக்கான நோன்பு மாதமாகும்.'
        },
        Sinhala: {
          title: 'මූස්ලිම්වරු උදෑසන සිට සන්ධ්‍යා වෙනි වෙලාව දක්වා දිනන මාසය කුමක්ද?',
          body: 'නිවැරදි ඉස්ලාම් මාසය තෝරන්න.',
          options: ['Shawwal', 'Muharram', 'Ramadan', 'Dhul Hijjah'],
          correctAnswer: 'Ramadan',
          explanation: 'රමදාන් මූස්ලිම්වරුන්ට දිනන මාසයයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why prayer is important in Islam.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about the role of prayer for Muslims.',
      correctAnswer: 'Prayer helps Muslims remember God, stay disciplined, and feel part of the community.',
      explanation: 'A strong answer mentions prayer, discipline, and community.',
      translations: {
        Tamil: {
          title: 'இஸ்லாமில் பிரார்த்தனை ஏன் முக்கியம் என்பதை விளக்கவும்.',
          body: 'முஸ்லீம்கள் үшін பிரார்த்தனையின் பங்குகள் பற்றி எழுதவும்.',
          correctAnswer: 'பிரார்த்தனை முஸ்லீம்களுக்கு கடவுளை நினைவில் வைக்க, ஒழுக்கமாக இருக்க மற்றும் சமூகத்தின் ஒரு பகுதி போல உணர உதவுகிறது.',
          explanation: 'வலுவான பதில் பிரார்த்தனை, ஒழுக்கம் மற்றும் சமூகத்தை குறிப்பிட வேண்டும்.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Christianity', [
    {
      type: 'mcq',
      title: 'What festival celebrates the birth of Jesus?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct Christian festival.',
      options: ['Eid', 'Diwali', 'Christmas', 'Vesak'],
      correctAnswer: 'Christmas',
      explanation: 'Christmas celebrates the birth of Jesus.',
      translations: {
        Tamil: {
          title: 'ஈசுவரின் பிறப்பை கொண்டாடும் திருவிழா எது?',
          body: 'சரியான கிறிஸ்தவ திருவிழாவை தேர்வு செய்யவும்.',
          options: ['ஈத்', 'தீபாவளி', 'கிறிஸ்துமஸ்', 'வெசாக்'],
          correctAnswer: 'கிறிஸ்துமஸ்',
          explanation: 'கிறிஸ்துமஸ் ஈசுவரின் பிறப்பை கொண்டாடுகிறது.'
        },
        Sinhala: {
          title: 'යේසුස්ගේ උපත සැමරෙන උත්සවය කුමක්ද?',
          body: 'නිවැරදි ක්‍රිස්තියානි උත්සවය තෝරන්න.',
          options: ['Eid', 'Diwali', 'Christmas', 'Vesak'],
          correctAnswer: 'Christmas',
          explanation: 'Christmas යේසුස්ගේ උපත සැමරෙන උත්සවයකි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Where do Christians usually worship?',
      difficulty: 'Easy',
      points: 5,
      body: 'Select the place of worship.',
      options: ['Church', 'Temple', 'Mosque', 'Pagoda'],
      correctAnswer: 'Church',
      explanation: 'Christians often worship in churches.',
      translations: {
        Tamil: {
          title: 'கிறிஸ்தவர்கள் பொதுவாக எங்கு வழிபடுகின்றனர்?',
          body: 'வழிபாட்டு இடத்தைத் தேர்வு செய்யவும்.',
          options: ['சேர்ச்சி', 'கோயில்', 'மசூதி', 'பகோடா'],
          correctAnswer: 'சேர்ச்சி',
          explanation: 'கிறிஸ்தவர்கள் அதிகமாக சேர்ச்சிகளில் வழிபடுகின்றனர்.'
        },
        Sinhala: {
          title: 'ක්‍රිස්තියානිවරු සාමාන්‍යයෙන් කොහෙද පූජා කරනවා?',
          body: 'පූජා ස්ථානය තෝරන්න.',
          options: ['Church', 'Temple', 'Mosque', 'Pagoda'],
          correctAnswer: 'Church',
          explanation: 'ක්‍රිස්තියානිවරු බොහෝවිට සංඛ්‍යාත්මකව පූජා කරනවා.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe the importance of kindness in Christianity.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about why Christians value kindness.',
      correctAnswer: 'Kindness reflects Christian teachings about loving others, helping those in need, and acting with compassion.',
      explanation: 'A strong answer mentions love, compassion, and helping others.',
      translations: {
        Tamil: {
          title: 'கிறிஸ்தவத்தில் கருணை முக்கியமானதற்கான காரணம் என்ன?',
          body: 'கிறிஸ்தவர்கள் கருணையைக் ஏன் மதிக்கிறார்கள் என்று எழுதவும்.',
          correctAnswer: 'கருணை மற்றவர்களை காதலிப்பதும், தேவையுள்ளவர்களுக்கு உதவுவதும், கருணையோடு நடப்பதுமான கிறிஸ்தவ போதனைகளை பிரதிபலிக்கிறது.',
          explanation: 'வலுவான பதில் காதல், கருணை மற்றும் மற்றவர்களுக்கு உதவியை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'ක්‍රිස්තියානි ආගම තුළ කරුණාව වැදගත් වන්නේ ඇයි කියා විස්තර කරන්න.',
          body: 'ක්‍රිස්තියානිවරු කරුණාවට දක්වන වටිනාකම ගැන ලියන්න.',
          correctAnswer: 'කරුණාව අනෙකුත් පුද්ගලයින්ට ආදරය පෙන්වීමට, අවශ්‍ය අයට උදව් කිරීමට සහ කරුණාවෙන් ක්‍රියා කිරීමට ක්‍රිස්තියානි උගන්වීම් මඟින් උදව් කරනවා.',
          explanation: 'හොඳ පිළිතුර ආදරය, කරුණාව සහ අන් අයට උදව් කිරීම සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Art', [
    {
      type: 'mcq',
      title: 'Which material is used for painting?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct art material.',
      options: ['Brush', 'Drum', 'Guitar', 'Shoe'],
      correctAnswer: 'Brush',
      explanation: 'A brush is used for painting.',
      translations: {
        Tamil: {
          title: 'ஓவியத்திற்குப் பயன்படுத்தப்படும் பொருள் எது?',
          body: 'சரியான கலைப் பொருளை தேர்வு செய்யவும்.',
          options: ['துப்பை', 'தட்டு', 'கிதார்', 'பாதம்'],
          correctAnswer: 'துப்பை',
          explanation: 'ஓவியம் வரைய துப்பை பயன்படுத்தப்படுகிறது.'
        },
        Sinhala: {
          title: 'පෙණීමට භාවිතා වන ද්‍රව්‍ය කුමක්ද?',
          body: 'නිවැරදි කලා ද්‍රව්‍යය තෝරන්න.',
          options: ['පින', 'ඩ්රම්', 'ගිටාර්', 'සපත්තු'],
          correctAnswer: 'පින',
          explanation: 'පෙණීම සඳහා පින භාවිතා කරයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which color is made by mixing red and blue?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the blended color.',
      options: ['Purple', 'Green', 'Orange', 'Brown'],
      correctAnswer: 'Purple',
      explanation: 'Red and blue mix to make purple.',
      translations: {
        Tamil: {
          title: 'சிவப்பு மற்றும் நீலத்தை சேர்த்தால் எந்த நிறம் கிடைக்கிறது?',
          body: 'கலந்த நிறத்தை தேர்வு செய்யவும்.',
          options: ['இளங்கடப்பு', 'பச்சை', 'ஆரஞ்சு', 'பழுப்பு'],
          correctAnswer: 'இளங்கடுப்பு',
          explanation: 'சிவப்பு மற்றும் நீலம் சேர்ந்து இளங்கடுப்பு நிறத்தை உருவாக்கும்.'
        },
        Sinhala: {
          title: 'රතු සහ නිල් මිශ්‍ර කළ විට කුමන පාට ලැබේද?',
          body: 'මිශ්‍රිත පාට තෝරන්න.',
          options: ['දම්', 'කොළ', 'තැඹිලි', 'දුඹුරු'],
          correctAnswer: 'දම්',
          explanation: 'රතු හා නිල් මිශ්‍ර කිරීමෙන් දම් පාට සෑදෙනවා.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain why art is important in school.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about the benefits of studying art.',
      correctAnswer: 'Art helps students express ideas, explore creativity, and understand different cultures.',
      explanation: 'A strong answer mentions creativity, expression, and culture.',
      translations: {
        Tamil: {
          title: 'பள்ளியில் கலை முக்கியம் என்பது ஏன்?',
          body: 'கலையைப் படிப்பதின் நன்மைகள் குறித்து எழுதவும்.',
          correctAnswer: 'கலை மாணவர்களுக்கு கருத்துக்களை வெளிப்படுத்த, படைப்பாற்றலை ஆராய்ந்து, வேறுபட்ட பண்பாட்டை புரிந்துகொள்ள உதவுகிறது.',
          explanation: 'வலுவான பதில் படைப்பாற்றல், வெளிப்பாடு மற்றும் பண்பாட்டை குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'පාසලේ කලා වැදගත් වන්නේ ඇයි කියා පැහැදිලි කරන්න.',
          body: 'කලාව අධ්‍යයනය කිරීමේ වාසි ගැන ලියන්න.',
          correctAnswer: 'කලාව සිසුන්ට අදහස් ප්‍රකාශ කිරීමට, නිර්මාණශීලීත්වය විමර්ශනය කිරීමට සහ විවිධ සංස්කෘති හඳුනා ගැනීමට උපකාරී වේ.',
          explanation: 'හොඳ පිළිතුර නිර්මාණශීලීත්වය, ප්‍රකාශය සහ සංස්කෘති සමගින් අන්තර්ගත කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Dancing', [
    {
      type: 'mcq',
      title: 'Which word describes moving to music?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct activity.',
      options: ['Reading', 'Dancing', 'Sleeping', 'Painting'],
      correctAnswer: 'Dancing',
      explanation: 'Dancing is moving the body to music.',
      translations: {
        Tamil: {
          title: 'இசைக்கு உடலை நகர்த்துவது எது?',
          body: 'சரியான உருப்படியை தேர்வு செய்யவும்.',
          options: ['மேலும்', 'நடனம்', 'தூங்குதல்', 'படித்தல்'],
          correctAnswer: 'நடனம்',
          explanation: 'நடனம் என்பது இசைக்கு உடலை நகர்த்துவதாகும்.'
        },
        Sinhala: {
          title: 'සංගීතයට අනුව ගමන් කිරීමේ වචනය කුමක්ද?',
          body: 'නිවැරදි ක්‍රියාකාරකම තෝරන්න.',
          options: ['කියවීම', 'නටනය', 'නිදාගැනීම', 'වර්ණනය'],
          correctAnswer: 'නටනය',
          explanation: 'නටනය සංගීතයට අනුව ශරීරය ගමන් කිරීමයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What helps dancers keep rhythm?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct answer.',
      options: ['Silence', 'Beat', 'Darkness', 'Cold'],
      correctAnswer: 'Beat',
      explanation: 'A beat helps dancers keep rhythm.',
      translations: {
        Tamil: {
          title: 'நடனத்தை ஒத்திசைக்க என்ன உதவுகிறது?',
          body: 'சரியான பதிலை தேர்வு செய்யவும்.',
          options: ['அமைதி', 'தாளம்', 'இருள்', 'குளிர்'],
          correctAnswer: 'தாளம்',
          explanation: 'தாளம் நடனக்கலைக்கு ஒத்திசை பெற உதவுகிறது.'
        },
        Sinhala: {
          title: 'නර්ථකයින්ට තාලය රඳවා ගැනීමට කුමක් උදව් කරනවාද?',
          body: 'නිවැරදි පිළිතුර තෝරන්න.',
          options: ['නිහඬතාව', 'තාලය', 'අඳුරුකම', 'ශීතලය'],
          correctAnswer: 'තාලය',
          explanation: 'තාලය නර්ථනයේ තාලය රඳවා ගැනීමට උදව් කරනවා.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe a dance performance.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about what makes a dance show exciting.',
      correctAnswer: 'A dance performance is exciting when the music, costumes, and movements work together and the dancers show energy and expression.',
      explanation: 'A strong answer mentions music, movement, and expression.',
      translations: {
        Tamil: {
          title: 'ஒரு நடன நிகழ்ச்சியை விவரிக்கவும்.',
          body: 'ஒரு நடன நிகழ்ச்சி உன்னதமாக இருக்க என்ன செய்கிறது என்பதை எழுதவும்.',
          correctAnswer: 'இசை, உடைகளும், இயக்கங்களும் ஒன்றாக வேலை செய்யும்போது மற்றும் நடனக் கலைஞர்கள் ஆற்றலும் வெளிப்பாடும் காட்டும்போது நடனம் மிக அழகாக இருக்கும்.',
          explanation: 'வலுவான பதில் இசை, இயக்கம் மற்றும் வெளிப்பாடு குறித்து குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'නටන ඉදිරිපත් කිරීමක් විස්තර කරන්න.',
          body: 'නටන ප්‍රදර්ශනයක් රසවත් කරන දේ ගැන ලියන්න.',
          correctAnswer: 'සංගීතය, ඇඳුම් සහ චලන එකට හොඳින් එකතු වූ විට සහ නර්ථකයින් ශක්තිය සහ ප්‍රකාශය පෙන්වා දුන් විට නටන ඉදිරිපත් කිරීම රසවත් වේ.',
          explanation: 'හොඳ පිළිතුර සංගීතය, චලනය සහ ප්‍රකාශය ගැන සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Music', [
    {
      type: 'mcq',
      title: 'Which instrument has strings and is played with a bow?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct instrument.',
      options: ['Piano', 'Violin', 'Drum', 'Flute'],
      correctAnswer: 'Violin',
      explanation: 'A violin has strings and is played with a bow.',
      translations: {
        Tamil: {
          title: 'கயிறுகளைக் கொண்ட, ஊதியால் வாசிக்கப்படும் கருவி எது?',
          body: 'சரியான இசை கருவியை தேர்வு செய்யவும்.',
          options: ['பியானோ', 'வயலின்', 'தட்டை', 'வெள்ளம்பொங்கி'],
          correctAnswer: 'வயலின்',
          explanation: 'வயலினில் கயிறுகள் உள்ளன மற்றும் இது ஊதியால் வாசிக்கப்படுகிறது.'
        },
        Sinhala: {
          title: 'කෝඩු ඇත්තෙත් හා වෑන් එකෙනුත් වාදනය කරන වායුග්‍රාහක භාණ්ඩය කුමක්ද?',
          body: 'නිවැරදි වාද්‍යය තෝරන්න.',
          options: ['පියානෝ', 'වයලින්', 'ඩ්රම්', 'නළවේදය'],
          correctAnswer: 'වයලින්',
          explanation: 'වයලින්ට කෝඩු ඇති අතර වෑන් එකෙනුත් වාදනය කරයි.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the pattern of strong and weak beats called?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the musical term.',
      options: ['Melody', 'Rhythm', 'Color', 'Texture'],
      correctAnswer: 'Rhythm',
      explanation: 'Rhythm is the pattern of beats in music.',
      translations: {
        Tamil: {
          title: 'வலுவான மற்றும் மென்மையான தாள்களின் முறை என்ன அழைக்கிறோம்?',
          body: 'இசைச் சொற்றொடரை தேர்வு செய்யவும்.',
          options: ['இசை', 'தாளம்', 'நிறம்', 'தொலைவு'],
          correctAnswer: 'தாளம்',
          explanation: 'தாளம் என்பது இசையில் தாள்களின் முறை ஆகும்.'
        },
        Sinhala: {
          title: 'දෘඩ සහ දුර්වල අඩිවල රටාව කුමක් ලෙස හැඳින්වෙයි?',
          body: 'සංගීත වචනය තෝරන්න.',
          options: ['සුර', 'තාලය', 'වර්ණය', 'පටලය'],
          correctAnswer: 'තාලය',
          explanation: 'තාලය යනු සංගීතයේ ඕනෑම වාදනයක් සඳහා රටාවයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain how practice improves music skills.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about why musicians practice regularly.',
      correctAnswer: 'Practice helps musicians play more accurately, learn difficult pieces, and build confidence.',
      explanation: 'A strong answer mentions accuracy, repetition, and confidence.',
      translations: {
        Tamil: {
          title: 'பயிற்சி எப்படி இசை திறன்களை மேம்படுத்துகிறது என்பதைக் குறிப்பிடவும்.',
          body: 'சங்கிலக்காரர்கள் ஏன் வழக்கமாக பயிற்சி செய்ய நினைக்கிறார்கள் என்று எழுதவும்.',
          correctAnswer: 'பயிற்சி இசைக்கலைஞர்கள் துல்லியமாக வாசிக்க உதவுகிறது, கடினமான துணுக்குகளை கற்க உதவுகிறது மற்றும் தன்னம்பிக்கையை கட்டமைக்க உதவுகிறது.',
          explanation: 'வலுவான பதில் துல்லியத்தையும் மீள்பார்வையையும் மற்றும் தன்னம்பிக்கையையும் குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'පහසුකම් සංගීත හැකියාවන් වඩින ආකාරය විස්තර කරන්න.',
          body: 'සංගීතඥයින් නිතර පුහුණු වීමට හේතු ලියන්න.',
          correctAnswer: 'පහසුකම් සංගීතඥයින්ට වඩා නිවැරදි වාදනය කිරීමට, දුෂ්කර කැබින් ඉගෙන ගැනීමට සහ විශ්වාසය ගොඩනැගීමට උදව් කරනවා.',
          explanation: 'හොඳ පිළිතුර නිවැරදිභාවය, මාතරනාව සහ විශ්වාසය පිළිබඳව සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Drama & Theatre', [
    {
      type: 'mcq',
      title: 'Who performs on stage in a play?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct term.',
      options: ['Dancer', 'Actor', 'Painter', 'Singer'],
      correctAnswer: 'Actor',
      explanation: 'An actor performs on stage in a play.',
      translations: {
        Tamil: {
          title: 'நாடகத்தில் மேடையில் யார் நடிக்கார்?',
          body: 'சரியான பதத்தை தேர்வு செய்யவும்.',
          options: ['கூடல்', 'நடிகர்', 'சிற்பி', 'பாடகர்'],
          correctAnswer: 'நடிகர்',
          explanation: 'நடிகர் ஒரு நாடகத்தில் மேடையில் நடிக்கிறார்.'
        },
        Sinhala: {
          title: 'නाटकයකදී වේදිකාව මත ඉදිරිපත් කරන කවුරුද?',
          body: 'නිවැරදි පදය තෝරන්න.',
          options: ['නර්ථකයා', 'නළු', 'චිත්‍ර ශිල්පියා', 'ගායකයා'],
          correctAnswer: 'නළු',
          explanation: 'නළු නාට්‍යයකදී වේදිකාව මත ඉදිරිපත් කරනවා.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'What is the written text for actors to speak called?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct word.',
      options: ['Script', 'Song', 'Story', 'Recipe'],
      correctAnswer: 'Script',
      explanation: 'A script is the written text for a play.',
      translations: {
        Tamil: {
          title: 'நடிகர்கள் பேசுவதற்கான எழுத்து உரையை என்ன சொல்வது?',
          body: 'சரியான வார்த்தையை தேர்வு செய்யவும்.',
          options: ['கவிஞர்', 'பாடல்', 'கதை', 'சூத்திரம்'],
          correctAnswer: 'சூத்திரம்',
          explanation: 'நாடகத்திற்கான எழுத்து உரையை சூத்திரம் என்று சொல்கிறோம்.'
        },
        Sinhala: {
          title: 'නළුන්ට කතාව කියවීමට ලියන ලද පෙළ කුමක්ද?',
          body: 'නිවැරදි වචනය තෝරන්න.',
          options: ['පෙළ', 'ගීතය', 'කතාව', 'වට්ටෝරු'],
          correctAnswer: 'පෙළ',
          explanation: 'පෙළ යනු නළුන්ට කතාව කියවීමට ලියන ලද ලිඛිත පෙළයි.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Describe what makes a good theatre performance.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write about the elements of a strong play.',
      correctAnswer: 'A good theatre performance has clear acting, strong emotions, good timing, and a story that the audience understands.',
      explanation: 'A strong answer mentions acting, story, and audience engagement.',
      translations: {
        Tamil: {
          title: 'ஒரு நல்ல மேடை நிகழ்ச்சி என்ன காரணிகளால் உருவாகிறது என்பதை விவரிக்கவும்.',
          body: 'வலுவான நாடகத்தின் கூறுகளைப் பற்றி எழுதவும்.',
          correctAnswer: 'ஒரு நல்ல மேடை நிகழ்ச்சியில் தெளிவான நடிப்பு, வலுவான உணர்ச்சிகள், நல்ல நேர்காணல் மற்றும் பார்வையாளர்கள் புரிந்துகொள்ளும் கதை இருக்க வேண்டும்.',
          explanation: 'வலுவான பதில் நடிப்பு, கதை மற்றும் பார்வையாளர்களின் ஈடுபாடு ஆகியவை குறித்து குறிப்பிட வேண்டும்.'
        },
        Sinhala: {
          title: 'හොඳ රංග වේදිකා ඉදිරිපත් කිරීමක් සාදන්නේ කෙසේදැයි විස්තර කරන්න.',
          body: 'බලවත් නාට්‍යයක අංග ගැන ලියන්න.',
          correctAnswer: 'හොඳ රංග වේදිකාවක් පැහැදිලි නිරූපණයකින්, ශක්තිමත් සංවේදනාත්මක කාර්යභාරයකින්, හොඳ කාලීනත්වයකින් සහ පිරිසට තේරෙන කතාවකින් යුක්ත වේ.',
          explanation: 'හොඳ පිළිතුර නිරූපණය, කතාව සහ පිරිසගේ ඉදිරියට යාම ගැන සඳහන් කරයි.'
        }
      }
    }
  ]),
  ...buildQuestions(8, 'Life Competencies', [
    {
      type: 'mcq',
      title: 'What skill helps you plan your school day?',
      difficulty: 'Easy',
      points: 5,
      body: 'Choose the correct life skill.',
      options: ['Sleeping', 'Time management', 'Watching TV', 'Eating snacks'],
      correctAnswer: 'Time management',
      explanation: 'Time management helps plan how to use the day well.',
      translations: {
        Tamil: {
          title: 'நீங்கள் உங்கள் பள்ளி நாளை திட்டமிட எந்த திறன் உதவுகிறது?',
          body: 'சரியான வாழ்வுத் திறனைக் தேர்வு செய்யவும்.',
          options: ['தூங்குதல்', 'நேர மேலாண்மை', 'தொலைக்காட்சி பார்ப்பது', 'உணவுப்பொருட்களை சாப்பிடுதல்'],
          correctAnswer: 'நேர மேலாண்மை',
          explanation: 'நேர மேலாண்மை நாளை எப்படி சிறப்பாக பயன்படுத்துவது என்பதை திட்டமிட உதவுகிறது.'
        },
        Sinhala: {
          title: 'ඔබේ පාසැල් දවස සැලසුම් කිරීමට උදව් කරන කුසලතාව කුමක්ද?',
          body: 'නිවැරදි ජීවන කුසලතාව තෝරන්න.',
          options: ['නිදාගැනීම', 'කාල කළමනාකරණය', 'දුරදසුන බලනවා', 'කෑම කවීම'],
          correctAnswer: 'කාල කළමනාකරණය',
          explanation: 'කාල කළමනාකරණය දවස හොඳින් සැලසුම් කිරීමට සහ ප්‍රයෝජනවත් ලෙස භාවිත කිරීමට උදව් කරනවා.'
        }
      }
    },
    {
      type: 'mcq',
      title: 'Which quality helps you work well with others?',
      difficulty: 'Medium',
      points: 8,
      body: 'Select the correct teamwork skill.',
      options: ['Selfishness', 'Listening', 'Arguing', 'Ignoring'],
      correctAnswer: 'Listening',
      explanation: 'Listening helps people cooperate as a team.',
      translations: {
        Tamil: {
          title: 'மற்றவர்களுடன் நன்கு பணியாற்ற எந்தத் தன்மை உதவுகிறது?',
          body: 'தூய்மையான குழு திறனை தேர்வு செய்யவும்.',
          options: ['சுயநலமாக இருக்குதல்', 'கேட்குதல்', 'வாதமிடுதல்', 'புறக்கணித்தல்'],
          correctAnswer: 'கேட்குதல்',
          explanation: 'கேட்குதல் குழுவாக ஒத்துழைக்க உதவுகிறது.'
        },
        Sinhala: {
          title: 'ඔබට අනෙකුත් අය සමඟ හොඳින් වැඩ කිරීමට උදව් කරන ගුණය කුමක්ද?',
          body: 'නිවැරදි කණ්ඩායම් කුසලතාව තෝරන්න.',
          options: ['ස්වකීයභාවය', 'අහලීම', 'වෙරදීම', 'පෙනහළීම'],
          correctAnswer: 'අහලීම',
          explanation: 'අහලීම කණ්ඩායම් තුළ එකට වැඩ කිරීමට සහය වනවා.'
        }
      }
    },
    {
      type: 'structured',
      title: 'Explain how to solve a problem step by step.',
      difficulty: 'Hard',
      points: 15,
      body: 'Write the steps you use to solve a challenge.',
      correctAnswer: 'First identify the problem, then think of solutions, choose the best one, and try it carefully.',
      explanation: 'A strong answer explains problem definition, planning, and action.',
      translations: {
        Tamil: {
          title: 'ஒரு பிரச்சினையை படி படியாக எப்படி தீர்க்குவது என்பதை விளக்கவும்.',
          body: 'சவாலானதை நீங்கள் தீர்க்க எவ்வாறு படிநிலையாக செயல்படுகிறீர்கள் என்பதை எழுதவும்.',
          correctAnswer: 'முதலில் பிரச்சினையை கண்டறிந்து, பின்னர் தீர்வுகளை யோசித்து, சிறந்ததை தேர்வு செய்து, அதை கவனமாக முயற்சிக்கவும்.',
          explanation: 'வலுவான பதில் பிரச்சினை வரையறை, திட்டமிடல் மற்றும் செயல்பாடு ஆகியவற்றை விளக்க வேண்டும்.'
        },
        Sinhala: {
          title: 'ගැටළුවක් පියවරින් පියවර විසඳන ආකාරය විස්තර කරන්න.',
          body: 'අභියෝගයක් විසඳීමට ඔබ ගන්නා පියවර ලියන්න.',
          correctAnswer: 'පළමුව ගැටළුව හඳුනාගෙන, පසුව විසදුම් සිතා බලා, හොඳම එක තෝරා, එය ක්‍රියාත්මක කරන්න.',
          explanation: 'හොඳ පිළිතුර ගැටළුව හඳුනා ගැනීම, සැලසුම් කිරීම සහ ක්‍රියාව පිළිබඳව පැහැදිලිව කියයි.'
        }
      }
    }
  ]),
  ...buildMixedQuestionBankForSubjects(6, subjectsByGrade[6]),
  ...buildMixedQuestionBankForSubjects(9, subjectsByGrade[9])
];
