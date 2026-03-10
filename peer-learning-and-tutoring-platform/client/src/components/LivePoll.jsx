import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Check, X, BarChart3, Users, Clock, ChevronRight,
  Play, Square, RotateCcw, Award
} from 'lucide-react';

const LivePoll = ({ 
  poll, 
  isInstructor = false, 
  onVote, 
  onStartPoll, 
  onEndPoll,
  onCreatePoll,
  userId,
  totalParticipants = 0
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [newPollData, setNewPollData] = useState({
    question: '',
    options: ['', ''],
    correctAnswer: null
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (poll && poll.responses) {
      const userVote = poll.responses.find(r => r.user === userId);
      if (userVote) {
        setSelectedOption(userVote.answer);
        setHasVoted(true);
      }
    }
  }, [poll, userId]);

  const handleVote = async (optionIndex) => {
    if (hasVoted || !poll?.isActive) return;
    
    try {
      await onVote(poll._id || poll.id, optionIndex);
      setSelectedOption(optionIndex);
      setHasVoted(true);
      toast.success('Vote submitted!');
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    if (!newPollData.question.trim() || newPollData.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await onCreatePoll({
        question: newPollData.question,
        options: newPollData.options.filter(opt => opt.trim()),
        correctAnswer: newPollData.correctAnswer,
        isActive: false
      });
      
      setNewPollData({ question: '', options: ['', ''], correctAnswer: null });
      setIsCreating(false);
      toast.success('Poll created successfully!');
    } catch (error) {
      toast.error('Failed to create poll');
    }
  };

  const addOption = () => {
    setNewPollData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (newPollData.options.length <= 2) return;
    
    setNewPollData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer === index ? null : 
                    prev.correctAnswer > index ? prev.correctAnswer - 1 : 
                    prev.correctAnswer
    }));
  };

  const updateOption = (index, value) => {
    setNewPollData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const getResults = () => {
    if (!poll?.responses) return [];
    
    const totalVotes = poll.responses.length;
    return poll.options.map((option, index) => {
      const votes = poll.responses.filter(r => r.answer === index).length;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      return {
        option,
        votes,
        percentage: Math.round(percentage * 10) / 10,
        isCorrect: poll.correctAnswer === index
      };
    });
  };

  if (isCreating && isInstructor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Create New Poll
        </h3>
        
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={newPollData.question}
              onChange={(e) => setNewPollData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {newPollData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newPollData.correctAnswer === index}
                    onChange={() => setNewPollData(prev => ({ ...prev, correctAnswer: index }))}
                    className="w-4 h-4 text-blue-600"
                    title="Mark as correct answer (optional)"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {newPollData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Poll
            </button>
          </div>
        </form>
      </motion.div>
    );
  }

  if (!poll) {
    if (isInstructor) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Poll</h3>
          <p className="text-gray-600 mb-4">Create a poll to engage with your students</p>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Poll</h3>
        <p className="text-gray-600">Waiting for instructor to start a poll...</p>
      </motion.div>
    );
  }

  const results = getResults();
  const totalVotes = poll.responses?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      {/* Poll Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Live Poll
          </h3>
          <p className="text-gray-600 mt-1">{poll.question}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {poll.isActive && (
            <span className="flex items-center text-green-600 text-sm">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
              Live
            </span>
          )}
          
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-1" />
            {totalVotes} votes
          </div>
        </div>
      </div>

      {/* Instructor Controls */}
      {isInstructor && (
        <div className="flex space-x-2 mb-4">
          {!poll.isActive ? (
            <button
              onClick={() => onStartPoll(poll._id || poll.id)}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Poll
            </button>
          ) : (
            <button
              onClick={() => onEndPoll(poll._id || poll.id)}
              className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Square className="w-4 h-4 mr-1" />
              End Poll
            </button>
          )}
          
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {showResults ? 'Hide Results' : 'Show Results'}
          </button>
        </div>
      )}

      {/* Voting Options */}
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const result = results[index];
          const isSelected = selectedOption === index;
          const showResultsForOption = showResults || !poll.isActive;
          
          return (
            <motion.button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted || !poll.isActive}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : hasVoted
                  ? 'border-gray-200 bg-gray-50 opacity-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              whileHover={!hasVoted && poll.isActive ? { scale: 1.02 } : {}}
              whileTap={!hasVoted && poll.isActive ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium">{option}</span>
                </div>
                
                {showResultsForOption && (
                  <div className="flex items-center">
                    {result.isCorrect && (
                      <Award className="w-5 h-5 text-green-500 mr-2" />
                    )}
                    <span className="font-semibold text-gray-700">
                      {result.percentage}%
                    </span>
                  </div>
                )}
              </div>
              
              {showResultsForOption && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        result.isCorrect ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.votes} vote{result.votes !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Voting Status */}
      {hasVoted && poll.isActive && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 flex items-center">
            <Check className="w-4 h-4 mr-2" />
            You have voted! Waiting for poll to end...
          </p>
        </div>
      )}

      {/* Create New Poll Button for Instructor */}
      {isInstructor && !poll.isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Poll
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LivePoll;
