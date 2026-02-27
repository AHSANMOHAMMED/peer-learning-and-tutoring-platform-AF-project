import React, { useState } from 'react';
import { ThumbsUp, ThumbsUp as ThumbsUpFilled, ThumbsDown, ThumbsDown as ThumbsDownFilled } from 'lucide-react';
import axios from 'axios';

const VoteButtons = ({ targetType, targetId, userVote, onVote, upvotes, downvotes, size = 'md' }) => {
  const [voting, setVoting] = useState(false);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleVote = async (voteType) => {
    if (voting) return;
    
    setVoting(true);
    
    try {
      const response = await axios.post('/api/votes', {
        targetType,
        targetId,
        voteType
      });

      const { voteCounts, userVote: newUserVote, action } = response.data;
      
      setLocalUserVote(newUserVote);
      setLocalUpvotes(voteCounts.upvotes);
      setLocalDownvotes(voteCounts.downvotes);
      
      if (onVote) {
        onVote(voteType, voteCounts, newUserVote, action);
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on error
      setLocalUserVote(userVote);
      setLocalUpvotes(upvotes);
      setLocalDownvotes(downvotes);
    } finally {
      setVoting(false);
    }
  };

  const voteScore = localUpvotes - localDownvotes;
  const totalVotes = localUpvotes + localDownvotes;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={voting}
        className={`${sizeClasses[size]} rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          localUserVote === 'up' ? 'border-green-500 bg-green-50' : ''
        }`}
        title={localUserVote === 'up' ? 'Remove upvote' : 'Upvote'}
      >
        {localUserVote === 'up' ? (
          <ThumbsUpFilled className={`${iconSizes[size]} text-green-600`} />
        ) : (
          <ThumbsUp className={`${iconSizes[size]} text-gray-600`} />
        )}
      </button>

      {/* Vote Score */}
      <div className="text-center">
        <div className={`font-semibold ${
          voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-700'
        }`}>
          {voteScore}
        </div>
        {totalVotes > 0 && (
          <div className="text-xs text-gray-500">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={voting}
        className={`${sizeClasses[size]} rounded-lg border border-gray-300 hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          localUserVote === 'down' ? 'border-red-500 bg-red-50' : ''
        }`}
        title={localUserVote === 'down' ? 'Remove downvote' : 'Downvote'}
      >
        {localUserVote === 'down' ? (
          <ThumbsDownFilled className={`${iconSizes[size]} text-red-600`} />
        ) : (
          <ThumbsDown className={`${iconSizes[size]} text-gray-600`} />
        )}
      </button>
    </div>
  );
};

export default VoteButtons;
