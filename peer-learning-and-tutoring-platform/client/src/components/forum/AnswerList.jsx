import React, { useState } from 'react';
import { CheckCircle, MessageSquare, Edit, Trash2, Flag, Clock } from 'lucide-react';
import VoteButtons from './VoteButtons';
import CommentSection from './CommentSection';
import RichTextEditor from './RichTextEditor';
import axios from 'axios';

const AnswerList = ({ answers, questionId, onAnswerUpdate, onQuestionUpdate }) => {
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const handleAcceptAnswer = async (answerId) => {
    try {
      await axios.post(`/api/answers/${answerId}/accept`);
      onAnswerUpdate();
      onQuestionUpdate();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer._id);
    setEditContent(answer.body);
  };

  const handleSaveEdit = async (answerId) => {
    try {
      setSubmittingEdit(true);
      await axios.put(`/api/answers/${answerId}`, {
        body: editContent
      });
      setEditingAnswer(null);
      setEditContent('');
      onAnswerUpdate();
    } catch (error) {
      console.error('Error editing answer:', error);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await axios.delete(`/api/answers/${answerId}`);
        onAnswerUpdate();
        onQuestionUpdate();
      } catch (error) {
        console.error('Error deleting answer:', error);
      }
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

  const currentUserId = localStorage.getItem('userId');

  if (answers.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
        <p className="text-gray-600">Be the first to answer this question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <div
          key={answer._id}
          className={`border rounded-lg p-4 ${
            answer.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center">
              <VoteButtons
                targetType="answer"
                targetId={answer._id}
                userVote={answer.userVote}
                upvotes={answer.upvotes}
                downvotes={answer.downvotes}
                size="sm"
              />
            </div>

            {/* Answer Content */}
            <div className="flex-1">
              {/* Accepted Answer Badge */}
              {answer.isAccepted && (
                <div className="inline-flex items-center gap-2 mb-3 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Accepted Answer</span>
                </div>
              )}

              {/* Answer Body */}
              {editingAnswer === answer._id ? (
                <div className="mb-4">
                  <RichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Edit your answer..."
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingAnswer(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(answer._id)}
                      disabled={submittingEdit || !editContent.trim()}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingEdit ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none mb-4">
                  <div dangerouslySetInnerHTML={{ __html: answer.body }} />
                </div>
              )}

              {/* Answer Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      {answer.author?.profile?.firstName?.[0] || 'U'}
                    </div>
                    <span>
                      {answer.author?.profile?.firstName} {answer.author?.profile?.lastName}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{getTimeAgo(answer.createdAt)}</span>
                    {answer.isEdited && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">edited</span>
                      </>
                    )}
                  </div>
                  
                  {answer.commentCount > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {answer.commentCount}
                    </div>
                  )}
                </div>

                {/* Answer Actions */}
                <div className="flex items-center gap-2">
                  {/* Accept Answer Button (for question author) */}
                  {!answer.isAccepted && answer.question?.author === currentUserId && (
                    <button
                      onClick={() => handleAcceptAnswer(answer._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </button>
                  )}

                  {/* Edit/Delete Buttons (for answer author) */}
                  {answer.author?._id === currentUserId && (
                    <>
                      <button
                        onClick={() => handleEditAnswer(answer)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnswer(answer._id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Report Button */}
                  <button className="text-gray-500 hover:text-gray-700">
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <CommentSection targetType="answer" targetId={answer._id} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerList;
