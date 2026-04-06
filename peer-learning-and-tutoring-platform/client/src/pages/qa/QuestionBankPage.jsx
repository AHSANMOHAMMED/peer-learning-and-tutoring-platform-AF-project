import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { gradeLabels, loadPreferredMedium, getLocalizedSubjectName, getLocalizedQuestion, getLocalizedDifficultyLabel, getEffectiveQuestionMedium, qaForumSupportedGrades } from '../../data/qaData';
import { qaForumService } from '../../services/qaForumService';

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-orange-100 text-orange-800',
  Hard: 'bg-red-100 text-red-800'
};

const typeColors = {
  mcq: 'bg-indigo-100 text-indigo-800',
  structured: 'bg-cyan-100 text-cyan-800'
};

const uiTextByMedium = {
  English: {
    headingPrefix: 'Questions for',
    subtitle: (grade) => `Grade ${grade} practice questions with search, filters, and quick attempt buttons.`,
    preferredMediumLabel: 'Preferred medium',
    preferredMediumHint: 'You can change it any time before you start a new topic.',
    changeSubject: 'Change subject',
    changeMedium: 'Change medium',
    backToGrades: 'Back to grades',
    accessUnavailable: 'Access unavailable',
    accessDeniedByGrade: (grade) => `You must log in as a student assigned to Grade ${grade} to view these questions.`,
    accessDeniedUnsupported: 'This QA forum currently supports Grades 6, 8, and 9 only.',
    searchPlaceholder: 'Search questions...',
    allDifficulties: 'All difficulties',
    allTypes: 'All question types',
    structuredEssay: 'Structured / essay',
    mcq: 'MCQ',
    sortNewest: 'Sort by newest',
    sortDifficulty: 'Sort by difficulty',
    sortPoints: 'Sort by points',
    loading: 'Loading questions...',
    pleaseWait: 'Please wait a moment.',
    emptyTitle: 'No questions found for this subject.',
    emptyHint: 'Try a different filter or choose another subject.',
    gradeLabel: (grade) => `Grade ${grade}`,
    pointsLabel: (points) => `${points} pts`,
    attempt: 'Attempt',
    fallbackTitle: (subject) => `${subject} question`
  },
  Sinhala: {
    headingPrefix: 'විෂය සඳහා ප්‍රශ්න',
    subtitle: (grade) => `${grade} ශ්‍රේණිය සඳහා සෙවීම, පෙරහන් සහ ඉක්මන් උත්සාහ බොත්තම් සහිත පුහුණු ප්‍රශ්න.`,
    preferredMediumLabel: 'තෝරාගත් මාධ්‍යය',
    preferredMediumHint: 'නව මාතෘකාවක් ආරම්භ කිරීමට පෙර ඔබට මෙය ඕනෑම වේලාවක වෙනස් කළ හැකිය.',
    changeSubject: 'විෂයය වෙනස් කරන්න',
    changeMedium: 'මාධ්‍යය වෙනස් කරන්න',
    backToGrades: 'ශ්‍රේණි වෙත ආපසු',
    accessUnavailable: 'ප්‍රවේශය නොමැත',
    accessDeniedByGrade: (grade) => `මෙම ප්‍රශ්න බැලීමට ඔබ ${grade} ශ්‍රේණියට අයත් ශිෂ්‍යයෙකු ලෙස පිවිසිය යුතුය.`,
    accessDeniedUnsupported: 'මෙම QA සංසදය දැනට සහාය දක්වන්නේ 6, 8 සහ 9 ශ්‍රේණි සඳහා පමණි.',
    searchPlaceholder: 'ප්‍රශ්න සොයන්න...',
    allDifficulties: 'සියලු අපහසුතා',
    allTypes: 'සියලු ප්‍රශ්න වර්ග',
    structuredEssay: 'ව්‍යුහගත / රචනා',
    mcq: 'බහු තේරීම්',
    sortNewest: 'අලුත්ම අනුව',
    sortDifficulty: 'අපහසුතාව අනුව',
    sortPoints: 'ලකුණු අනුව',
    loading: 'ප්‍රශ්න පූරණය වෙමින්...',
    pleaseWait: 'කරුණාකර මොහොතක් රැඳී සිටින්න.',
    emptyTitle: 'මෙම විෂය සඳහා ප්‍රශ්න සොයාගත නොහැක.',
    emptyHint: 'වෙනත් පෙරහනක් භාවිතා කරන්න හෝ වෙනත් විෂයයක් තෝරන්න.',
    gradeLabel: (grade) => `${grade} ශ්‍රේණිය`,
    pointsLabel: (points) => `${points} ලකුණු`,
    attempt: 'උත්සාහ කරන්න',
    fallbackTitle: (subject) => `${subject} ප්‍රශ්නය`
  },
  Tamil: {
    headingPrefix: 'பாடத்திற்கான கேள்விகள்',
    subtitle: (grade) => `${grade} ஆம் வகுப்பிற்கான தேடல், வடிகட்டி மற்றும் விரைவான முயற்சி பொத்தான்களுடன் பயிற்சி கேள்விகள்.`,
    preferredMediumLabel: 'தேர்ந்தெடுத்த மூலம்',
    preferredMediumHint: 'புதிய தலைப்பை தொடங்கும் முன் இதை எப்போது வேண்டுமானாலும் மாற்றலாம்.',
    changeSubject: 'பாடத்தை மாற்று',
    changeMedium: 'மூலத்தை மாற்று',
    backToGrades: 'வகுப்புகளுக்கு திரும்பு',
    accessUnavailable: 'அணுகல் இல்லை',
    accessDeniedByGrade: (grade) => `இந்த கேள்விகளை பார்க்க நீங்கள் ${grade} ஆம் வகுப்பிற்கான மாணவராக உள்நுழைய வேண்டும்.`,
    accessDeniedUnsupported: 'இந்த QA தளம் தற்போது 6, 8, 9 வகுப்புகளுக்கு மட்டும் ஆதரவு அளிக்கிறது.',
    searchPlaceholder: 'கேள்விகளைத் தேடுங்கள்...',
    allDifficulties: 'அனைத்து சிரம நிலைகள்',
    allTypes: 'அனைத்து கேள்வி வகைகள்',
    structuredEssay: 'கட்டமைக்கப்பட்ட / கட்டுரை',
    mcq: 'பல்தேர்வு',
    sortNewest: 'புதியவை முதலில்',
    sortDifficulty: 'சிரம நிலைப்படி',
    sortPoints: 'மதிப்பெண் படி',
    loading: 'கேள்விகள் ஏற்றப்படுகிறது...',
    pleaseWait: 'தயவுசெய்து ஒரு நிமிடம் காத்திருக்கவும்.',
    emptyTitle: 'இந்த பாடத்திற்கு கேள்விகள் இல்லை.',
    emptyHint: 'வேறு வடிகட்டியை பயன்படுத்துங்கள் அல்லது வேறு பாடத்தைத் தேர்வுசெய்யுங்கள்.',
    gradeLabel: (grade) => `${grade} ஆம் வகுப்பு`,
    pointsLabel: (points) => `${points} மதிப்பெண்`,
    attempt: 'முயற்சி செய்',
    fallbackTitle: (subject) => `${subject} கேள்வி`
  }
};

const QuestionBankPage = () => {
  const { grade, subject } = useParams();
  const numericGrade = Number(grade);
  const decodedSubject = decodeURIComponent(subject);
  const { user, isAuthenticated } = useAuth();
  const selectedGrade = Number(user?.profile?.grade);
  const isSupportedGrade = qaForumSupportedGrades.includes(numericGrade);
  const allowed = isAuthenticated && user?.role === 'student' && isSupportedGrade && selectedGrade === numericGrade;
  const preferredMedium = loadPreferredMedium();
  const pageMedium = getEffectiveQuestionMedium(decodedSubject, preferredMedium);
  const uiText = uiTextByMedium[pageMedium] || uiTextByMedium.English;

  const [filters, setFilters] = useState({ search: '', difficulty: 'all', type: 'all', sortBy: 'newest' });
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      if (!allowed) {
        setIsLoadingQuestions(false);
        return;
      }
      setIsLoadingQuestions(true);
      const result = await qaForumService.fetchQuestions({ grade: numericGrade, subject: decodedSubject });
      if (!active) return;
      if (result.success) {
        setAllQuestions(result.data || []);
      }
      setIsLoadingQuestions(false);
    };
    loadQuestions();
    return () => {
      active = false;
    };
  }, [allowed, numericGrade, decodedSubject]);

  const filteredQuestions = useMemo(() => {
    let items = allQuestions.filter((q) => q.grade === numericGrade && q.subject === decodedSubject);

    const forcedMedium = pageMedium;
    const selectedMediumTag = `medium-${forcedMedium.toLowerCase()}`;
    const mediumTags = ['medium-english', 'medium-tamil', 'medium-sinhala'];
    items = items.filter((q) => {
      const tags = Array.isArray(q.tags) ? q.tags.map((tag) => String(tag).toLowerCase()) : [];
      const hasAnyMediumTag = tags.some((tag) => mediumTags.includes(tag));

      if (!hasAnyMediumTag) {
        return forcedMedium === 'English';
      }

      return tags.includes(selectedMediumTag);
    });

    if (filters.search) {
      const query = filters.search.toLowerCase();
      items = items.filter((q) => q.title.toLowerCase().includes(query) || q.body.toLowerCase().includes(query));
    }

    if (filters.difficulty !== 'all') {
      items = items.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters.type !== 'all') {
      items = items.filter((q) => q.type === filters.type);
    }

    if (filters.sortBy === 'points') {
      items = [...items].sort((a, b) => b.points - a.points);
    } else if (filters.sortBy === 'difficulty') {
      const order = { Easy: 1, Medium: 2, Hard: 3 };
      items = [...items].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }

    return items;
  }, [numericGrade, decodedSubject, filters, allQuestions, pageMedium]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{uiText.headingPrefix} {getLocalizedSubjectName(decodedSubject, pageMedium)}</h1>
          <p className="text-slate-600">{uiText.subtitle(numericGrade)}</p>
          <p className="mt-2 text-slate-500">{uiText.preferredMediumLabel}: <strong>{pageMedium}</strong>. {uiText.preferredMediumHint}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/qa/grades/${numericGrade}/subjects`} className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors">{uiText.changeSubject}</Link>
          <Link to="/qa/medium" className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors">{uiText.changeMedium}</Link>
          <Link to="/qa/grades" className="rounded-2xl border border-blue-600 px-4 py-2 text-blue-700 hover:bg-blue-50 transition-colors">{uiText.backToGrades}</Link>
        </div>
      </div>

      {!allowed ? (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-900">
          <h2 className="text-xl font-semibold mb-2">{uiText.accessUnavailable}</h2>
          <p className="text-slate-700">
            {isSupportedGrade
              ? uiText.accessDeniedByGrade(numericGrade)
              : uiText.accessDeniedUnsupported}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4 mb-8">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder={uiText.searchPlaceholder}
              className="col-span-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
            />
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="all">{uiText.allDifficulties}</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="all">{uiText.allTypes}</option>
              <option value="mcq">{uiText.mcq}</option>
              <option value="structured">{uiText.structuredEssay}</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="newest">{uiText.sortNewest}</option>
              <option value="difficulty">{uiText.sortDifficulty}</option>
              <option value="points">{uiText.sortPoints}</option>
            </select>
          </div>

          {isLoadingQuestions ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-slate-700 text-lg font-medium mb-3">{uiText.loading}</p>
              <p className="text-slate-500">{uiText.pleaseWait}</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-slate-700 text-lg font-medium mb-3">{uiText.emptyTitle}</p>
              <p className="text-slate-500">{uiText.emptyHint}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredQuestions.map((question) => {
                const displayQuestion = getLocalizedQuestion(question, pageMedium);
                const difficultyLabel = getLocalizedDifficultyLabel(question.difficulty, pageMedium);
                return (
                  <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-slate-500 text-sm mt-1 font-semibold">{displayQuestion.body}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[question.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                          {difficultyLabel}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColors[displayQuestion.type] || 'bg-slate-100 text-slate-700'}`}>
                          {displayQuestion.type === 'structured' ? uiText.structuredEssay : uiText.mcq}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-sm mb-5">
                      <span>{uiText.pointsLabel(displayQuestion.points)}</span>
                      <span>{uiText.gradeLabel(displayQuestion.grade)}</span>
                    </div>
                    <Link
                      to={`/qa/attempt/${displayQuestion.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {uiText.attempt}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionBankPage;
