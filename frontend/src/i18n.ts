import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to PeerLearn',
      dashboard: 'Dashboard',
      courses: 'Courses',
      tutors: 'Find Tutors',
      materials: 'Materials',
      settings: 'Settings',
      logout: 'Logout',
      ai_assistant: 'AI Assistant',
      gamification: 'Gamification',
      marketplace: 'Marketplace',
      planner: 'Study Planner',
      social: 'Social Feed',
      voice_tutor: 'Voice Tutor'
    }
  },
  si: {
    translation: {
      welcome: 'PeerLearn වෙත සාදරයෙන් පිළිගනිමු',
      dashboard: 'පුවරුව',
      courses: 'පාඨමාලා',
      tutors: 'ගුරුවරුන් සොයන්න',
      materials: 'ද්‍රව්‍ය',
      settings: 'සැකසුම්',
      logout: 'ලොග් අවුට්',
      ai_assistant: 'AI සහායක',
      gamification: 'ගැමිෆිකේෂන්',
      marketplace: 'වෙළඳපොළ',
      planner: 'අධ්‍යයන සැලසුම්කරු',
      social: 'සමාජ සංග්‍රහය',
      voice_tutor: 'හඬ උපදේශක'
    }
  },
  ta: {
    translation: {
      welcome: 'PeerLearn-க்கு வரவேற்கிறோம்',
      dashboard: 'டாஷ்போர்டு',
      courses: 'பாடப்பிரிவுகள்',
      tutors: 'ஆசிரியர்களைக் கண்டறியவும்',
      materials: 'பொருட்கள்',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
      ai_assistant: 'AI உதவியாளர்',
      gamification: 'கேமிஃபிகேஷன்',
      marketplace: 'சந்தை',
      planner: 'படிப்பு திட்டமிடுபவர்',
      social: 'சமூக ஊட்டம்',
      voice_tutor: 'குரல் பயிற்சியாளர்'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
