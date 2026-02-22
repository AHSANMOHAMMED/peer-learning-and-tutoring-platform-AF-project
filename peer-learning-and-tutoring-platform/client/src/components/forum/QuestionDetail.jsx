import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Clock, User, CheckCircle, Edit, Trash2, Flag } from 'lucide-react';
import axios from 'axios';
import VoteButtons from './VoteButtons';
import AnswerList from './AnswerList';
import CommentSection from './CommentSection';
import RichTextEditor from './RichTextEditor';
// import { useQuestionSocket, useSocketEvent } from '../../hooks/useSocket';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // Socket integration
  // const { socket, emitTyping } = useQuestionSocket(id);

  // Listen for real-time updates
  // useSocketEvent('newAnswer', (data) => {
  //   if (data.question._id === id) {
  //     setAnswers(prev => [data.answer, ...prev]);
  //     setQuestion(prev => ({ ...prev, answerCount: prev.answerCount + 1 }));
  //   }
  // });

  // useSocketEvent('voteUpdate', (data) => {
  //   if (data.targetId === id && data.targetType === 'question') {
  //     setQuestion(prev => ({
  //       ...prev,
  //       upvotes: data.voteCounts.upvotes,
  //       downvotes: data.voteCounts.downvotes
  //     }));
  //     setUserVote(data.userVote);
  //   }
  // });

  // useSocketEvent('newComment', (data) => {
  //   if (data.target._id === id && data.target.type === 'question') {
  //     // Refresh comments
  //     // This would ideally update the comment section directly
  //     console.log('New comment on question:', data.comment);
  //   }
  // });

  // useSocketEvent('userTyping', (data) => {
  //   if (data.questionId === id) {
  //     setTypingUsers(prev => {
  //       const newTypingUsers = new Set(prev);
  //       if (data.isTyping) {
  //         newTypingUsers.add(data.userId);
  //       } else {
  //         newTypingUsers.delete(data.userId);
  //       }
  //       return newTypingUsers;
  //     });
  //   }
  // });

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions/${id}`);
      setQuestion(response.data.question);
      setUserVote(response.data.userVote);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(`/api/answers/question/${id}`);
      setAnswers(response.data.answers);
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      const response = await axios.post('/api/votes', {
        targetType: 'question',
        targetId: id,
        voteType
      });
      
      setQuestion(prev => ({
        ...prev,
        upvotes: response.data.voteCounts.upvotes,
        downvotes: response.data.voteCounts.downvotes
      }));
      
      setUserVote(response.data.userVote);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    try {
      setSubmittingAnswer(true);
      await axios.post(`/api/answers/question/${id}`, {
        body: answerContent
      });
      
      setAnswerContent('');
      setShowAnswerForm(false);
      fetchAnswers();
      fetchQuestion(); // Update answer count
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return diffMins === 0 ? 'just now' : `${diffMins} min ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Question not found</h2>
          <p className="text-gray-600 mb-4">The question you're looking for doesn't exist or has been removed.</p>
          <Link to="/forum" className="text-blue-600 hover:text-blue-800">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <Link to="/forum" className="text-blue-600 hover:text-blue-800">
          ← Back to Forum
        </Link>
      </nav>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-6">
          {/* Vote Section */}
          <div className="flex flex-col items-center">
            <VoteButtons
              targetType="question"
              targetId={id}
              userVote={userVote}
              onVote={handleVote}
              upvotes={question.upvotes}
              downvotes={question.downvotes}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
            
            <div className="prose max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: question.body }} />
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {question.author?.profile?.firstName?.[0] || 'U'}
                  </div>
                  <span>
                    {question.author?.profile?.firstName} {question.author?.profile?.lastName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{getTimeAgo(question.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views} views
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question.answerCount} answers
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {question.category}
                </span>
                {question.isClosed && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                    Closed
                  </span>
                )}
              </div>
            </div>

            {/* Question Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Flag className="h-4 w-4" />
              </button>
              {question.author?._id === localStorage.getItem('userId') && (
                <>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-gray-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <CommentSection targetType="question" targetId={id} />
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.answerCount} {question.answerCount === 1 ? 'Answer' : 'Answers'}
          </h2>
          {!showAnswerForm && (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write Answer
            </button>
          )}
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleAnswerSubmit}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                // onChange={(value) => {
                //   setAnswerContent(value);
                //   // Emit typing indicator
                //   emitTyping(value.length > 0);
                // }}
                placeholder="Write your answer here..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerForm(false);
                    // emitTyping(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>
                {typingUsers.size === 1 ? 'Someone is typing' : `${typingUsers.size} people are typing`}...
              </span>
            </div>
          </div>
        )}

        {/* Answers List */}
        <AnswerList
          answers={answers}
          questionId={id}
          onAnswerUpdate={fetchAnswers}
          onQuestionUpdate={fetchQuestion}
        />
      </div>
    </div>
  );
};

export default QuestionDetail;
