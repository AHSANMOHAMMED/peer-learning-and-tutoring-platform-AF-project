import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loadPreferredMedium, saveQAAttempt, getLocalizedQuestion, getLocalizedSubjectName, getLocalizedDifficultyLabel, getEffectiveQuestionMedium } from '../../data/qaData';
import { qaForumService } from '../../services/qaForumService';

const uiTextByMedium = {
  English: {
    loadingTitle: 'Loading question...',
    loadingBody: 'Please wait.',
    notFoundTitle: 'Question not found',
    notFoundBody: 'Please return to the subject page and choose another question.',
    backToGrades: 'Back to grades',
    studentOnlyTitle: 'Student access only',
    studentOnlyBody: 'Please log in with a student account to attempt this question.',
    login: 'Log in',
    submittedTitle: 'Successfully submitted',
    submittedBody: 'Your answer has been submitted successfully.',
    attemptQuestion: 'Attempt question',
    preferredMedium: 'Preferred medium',
    points: (value) => `${value} points`,
    yourAnswer: 'Your answer',
    structuredPlaceholder: 'Write your structured response here...',
    submitAnswer: 'Submit Answer',
    howItWorks: 'How it works',
    structuredTips: [
      'Provide a reasoned response in your own words.',
      'After submission, compare with the sample answer below.',
      'Focus on the main concepts and structure of your answer.'
    ],
    mcqTips: [
      'Choose one answer and submit.',
      'If you are correct, you will earn points with a happy message.',
      'If you are wrong, you will see the correct answer plus a short explanation.'
    ],
    answerSubmitted: 'Answer submitted',
    recordedResponse: 'Your response has been recorded. Review the model answer below to compare the main points.',
    modelAnswer: 'Model answer:',
    wellDone: 'Well done!',
    earnedPoints: (value) => `You earned ${value} points for the correct answer.`,
    notQuiteRight: 'Not quite right',
    correctAnswerPrefix: 'The correct answer is',
    fallbackTitle: (subject) => `${subject} question`
  },
  Sinhala: {
    loadingTitle: 'ප්‍රශ්නය පූරණය වෙමින්...',
    loadingBody: 'කරුණාකර රැඳී සිටින්න.',
    notFoundTitle: 'ප්‍රශ්නය සොයාගත නොහැක',
    notFoundBody: 'කරුණාකර විෂය පිටුවට ආපසු ගොස් වෙනත් ප්‍රශ්නයක් තෝරන්න.',
    backToGrades: 'ශ්‍රේණි වෙත ආපසු',
    studentOnlyTitle: 'ශිෂ්‍ය ප්‍රවේශය පමණයි',
    studentOnlyBody: 'මෙම ප්‍රශ්නය උත්සාහ කිරීමට ශිෂ්‍ය ගිණුමකින් පිවිසෙන්න.',
    login: 'පිවිසෙන්න',
    submittedTitle: 'සාර්ථකව යොමු කළා',
    submittedBody: 'ඔබගේ පිළිතුර සාර්ථකව යොමු කරන ලදී.',
    attemptQuestion: 'ප්‍රශ්නය උත්සාහ කරන්න',
    preferredMedium: 'තෝරාගත් මාධ්‍යය',
    points: (value) => `${value} ලකුණු`,
    yourAnswer: 'ඔබගේ පිළිතුර',
    structuredPlaceholder: 'ඔබගේ ව්‍යුහගත පිළිතුර මෙහි ලියන්න...',
    submitAnswer: 'පිළිතුර යොමු කරන්න',
    howItWorks: 'එය ක්‍රියා කරන ආකාරය',
    structuredTips: [
      'ඔබේම වචන වලින් තාර්කික පිළිතුරක් දෙන්න.',
      'යොමු කිරීමෙන් පසු පහත ආදර්ශ පිළිතුර සමඟ සසඳන්න.',
      'ඔබගේ පිළිතුරේ ප්‍රධාන සංකල්ප සහ ව්‍යුහය මත අවධානය යොමු කරන්න.'
    ],
    mcqTips: [
      'එක් පිළිතුරක් තෝරා යොමු කරන්න.',
      'ඔබ නිවැරදි නම් සතුටු පණිවිඩයක් සමඟ ලකුණු ලැබේ.',
      'වැරදි නම් නිවැරදි පිළිතුර සහ කෙටි පැහැදිලි කිරීම පෙන්වයි.'
    ],
    answerSubmitted: 'පිළිතුර යොමු කරන ලදී',
    recordedResponse: 'ඔබගේ පිළිතුර සටහන් කර ඇත. ප්‍රධාන කරුණු සසඳා බැලීමට පහත ආදර්ශ පිළිතුර බලන්න.',
    modelAnswer: 'ආදර්ශ පිළිතුර:',
    wellDone: 'හොඳ වැඩක්!',
    earnedPoints: (value) => `නිවැරදි පිළිතුර සඳහා ඔබට ලකුණු ${value} ක් ලැබුණි.`,
    notQuiteRight: 'තව ටිකක් උත්සාහ කරන්න',
    correctAnswerPrefix: 'නිවැරදි පිළිතුර',
    fallbackTitle: (subject) => `${subject} ප්‍රශ්නය`
  },
  Tamil: {
    loadingTitle: 'கேள்வி ஏற்றப்படுகிறது...',
    loadingBody: 'தயவுசெய்து காத்திருக்கவும்.',
    notFoundTitle: 'கேள்வி கிடைக்கவில்லை',
    notFoundBody: 'பாடப் பக்கத்திற்குத் திரும்பி வேறு கேள்வியைத் தேர்வு செய்யவும்.',
    backToGrades: 'வகுப்புகளுக்கு திரும்பு',
    studentOnlyTitle: 'மாணவர் அணுகல் மட்டும்',
    studentOnlyBody: 'இந்த கேள்வியை முயற்சிக்க மாணவர் கணக்கில் உள்நுழையவும்.',
    login: 'உள்நுழை',
    submittedTitle: 'வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது',
    submittedBody: 'உங்கள் பதில் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
    attemptQuestion: 'கேள்வியை முயற்சி செய்',
    preferredMedium: 'தேர்ந்தெடுத்த மூலம்',
    points: (value) => `${value} மதிப்பெண்`,
    yourAnswer: 'உங்கள் பதில்',
    structuredPlaceholder: 'உங்கள் கட்டமைக்கப்பட்ட பதிலை இங்கே எழுதுங்கள்...',
    submitAnswer: 'பதில் சமர்ப்பிக்க',
    howItWorks: 'இது எப்படி செயல்படுகிறது',
    structuredTips: [
      'உங்கள் சொற்களில் பொருள் கொண்ட பதிலை வழங்குங்கள்.',
      'சமர்ப்பித்த பின் கீழே உள்ள மாதிரி பதிலுடன் ஒப்பிடுங்கள்.',
      'முக்கிய கருத்துகள் மற்றும் பதிலின் கட்டமைப்பில் கவனம் செலுத்துங்கள்.'
    ],
    mcqTips: [
      'ஒரு பதிலைத் தேர்வு செய்து சமர்ப்பிக்கவும்.',
      'சரியாக இருந்தால் உங்களுக்கு மதிப்பெண்கள் கிடைக்கும்.',
      'தவறாக இருந்தால் சரியான பதிலும் சுருக்க விளக்கமும் காட்டப்படும்.'
    ],
    answerSubmitted: 'பதில் சமர்ப்பிக்கப்பட்டது',
    recordedResponse: 'உங்கள் பதில் பதிவு செய்யப்பட்டது. முக்கிய அம்சங்களை ஒப்பிட கீழே உள்ள மாதிரி பதிலைப் பாருங்கள்.',
    modelAnswer: 'மாதிரி பதில்:',
    wellDone: 'அருமை!',
    earnedPoints: (value) => `சரியான பதிலுக்கு ${value} மதிப்பெண்கள் பெற்றுள்ளீர்கள்.`,
    notQuiteRight: 'இன்னும் சரியாக இல்லை',
    correctAnswerPrefix: 'சரியான பதில்',
    fallbackTitle: (subject) => `${subject} கேள்வி`
  }
};

const AttemptQuestionPage = () => {
  const { questionId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const preferredMedium = loadPreferredMedium();
  const pageMedium = useMemo(() => {
    return getEffectiveQuestionMedium(question?.subject, preferredMedium);
  }, [question?.subject, preferredMedium]);
  const uiText = uiTextByMedium[pageMedium] || uiTextByMedium.English;
  const userId = user?.id || user?._id || user?.userId || 'guest';
  const studentName = user?.displayName || user?.username || user?.profile?.firstName || 'Student';

  useEffect(() => {
    let active = true;
    const loadQuestion = async () => {
      setIsLoadingQuestion(true);
      const result = await qaForumService.fetchQuestionById(questionId);
      if (!active) return;
      if (result.success) {
        setQuestion(result.data);
      }
      setIsLoadingQuestion(false);
    };

    loadQuestion();
    return () => {
      active = false;
    };
  }, [questionId]);

  const localizedQuestion = getLocalizedQuestion(question, pageMedium);
  const isStructured = localizedQuestion?.type === 'structured';
  const localizedDifficulty = useMemo(
    () => getLocalizedDifficultyLabel(question?.difficulty, pageMedium),
    [question?.difficulty, pageMedium]
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    setSubmitError('');
    setIsSubmitting(true);

    let correct = false;
    if (localizedQuestion?.type === 'mcq') {
      correct = localizedQuestion.correctAnswer === answer;
      setIsCorrect(correct);
    } else {
      setIsCorrect(null);
    }

    if (question) {
      const earnedMarks = question.type === 'mcq' && correct ? question.points : 0;
      const safeQuestionTitle =
        localizedQuestion.title?.trim() ||
        localizedQuestion.body?.trim()?.slice(0, 120) ||
        `Question ${question.id}`;

      const response = await qaForumService.submitStudentAnswer({
        questionId: question.id,
        questionTitle: safeQuestionTitle,
        grade: question.grade,
        subject: question.subject,
        type: question.type,
        points: question.points,
        answer: answer.trim(),
        marks: earnedMarks,
        feedback: question.type === 'mcq'
          ? (correct ? 'Correct answer.' : 'Needs improvement.')
          : 'Pending tutor review',
        submittedAt: new Date().toISOString(),
      });

      if (!response?.success) {
        setSubmitError(response?.message || 'Failed to save answer to database.');
        setSubmitted(false);
        setShowSubmitPopup(false);
        setIsSubmitting(false);
        return;
      }

      saveQAAttempt(userId, {
        id: `${question.id}-${Date.now()}`,
        questionId: question.id,
        questionTitle: safeQuestionTitle,
        grade: question.grade,
        subject: question.subject,
        difficulty: question.difficulty,
        type: question.type,
        points: question.points,
        earned: earnedMarks,
        outcome: question.type === 'mcq' ? (correct ? 'Correct' : 'Incorrect') : 'Submitted',
        completedAt: new Date().toISOString(),
        medium: pageMedium,
      });

      setSubmitted(true);
      setShowSubmitPopup(true);
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!showSubmitPopup) return;
    const timer = setTimeout(() => {
      setShowSubmitPopup(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [showSubmitPopup]);

  if (isLoadingQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{uiText.loadingTitle}</h1>
          <p className="text-slate-600">{uiText.loadingBody}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{uiText.notFoundTitle}</h1>
          <p className="text-slate-600">{uiText.notFoundBody}</p>
          <Link to="/qa/grades" className="mt-5 inline-flex rounded-2xl border border-blue-600 px-5 py-3 text-blue-700 hover:bg-blue-50 transition-colors">{uiText.backToGrades}</Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">{uiText.studentOnlyTitle}</h1>
          <p className="text-slate-700">{uiText.studentOnlyBody}</p>
          <Link to="/login" className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition-colors">{uiText.login}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {showSubmitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl border border-slate-200 animate-pulse">
            <h2 className="text-2xl font-bold text-emerald-600">{uiText.submittedTitle}</h2>
            <p className="mt-2 text-slate-600">{uiText.submittedBody}</p>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">{uiText.attemptQuestion}</p>
            <p className="text-slate-600 mt-2 font-semibold">{localizedQuestion.body}</p>
            <p className="mt-3 text-sm text-slate-500">{uiText.preferredMedium}: <strong>{pageMedium}</strong></p>
          </div>
          <div className="space-y-2 text-right">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{localizedDifficulty}</span>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{uiText.points(localizedQuestion.points)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {isStructured ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">{uiText.yourAnswer}</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  placeholder={uiText.structuredPlaceholder}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            ) : (
              localizedQuestion.options.map((option) => (
                <label key={option} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answer === option}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="text-slate-900 font-semibold">{option}</span>
                </label>
              ))
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-white font-semibold hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : uiText.submitAnswer}
          </button>

          {submitError && (
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
          )}
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{uiText.howItWorks}</h2>
          <ul className="space-y-3 text-slate-600">
            {isStructured ? (
              <>
                {uiText.structuredTips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </>
            ) : (
              <>
                {uiText.mcqTips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </>
            )}
          </ul>
          <Link to="/qa/grades" className="mt-6 inline-flex rounded-2xl border border-blue-600 px-5 py-3 text-blue-700 hover:bg-blue-50 transition-colors">{uiText.backToGrades}</Link>
        </div>
      </div>

      {submitted && (
        <div className={`mt-8 rounded-3xl p-6 shadow-sm ${isStructured ? 'bg-cyan-50 border-cyan-200 text-cyan-900' : isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
          {isStructured ? (
            <>
              <h2 className="text-2xl font-semibold">{uiText.answerSubmitted}</h2>
              <p className="mt-3 text-slate-700">{uiText.recordedResponse}</p>
              <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-slate-800">
                <p className="font-semibold">{uiText.modelAnswer}</p>
                <p className="mt-2">{localizedQuestion.correctAnswer}</p>
              </div>
              <p className="mt-4 text-slate-700">{localizedQuestion.explanation}</p>
            </>
          ) : isCorrect ? (
            <>
              <h2 className="text-2xl font-semibold">{uiText.wellDone}</h2>
              <p className="mt-3 text-slate-700">{uiText.earnedPoints(localizedQuestion.points)}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">{uiText.notQuiteRight}</h2>
              <p className="mt-3 text-slate-700">{uiText.correctAnswerPrefix} <strong>{localizedQuestion.correctAnswer}</strong>.</p>
              <p className="mt-2 text-slate-700">{localizedQuestion.explanation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttemptQuestionPage;
