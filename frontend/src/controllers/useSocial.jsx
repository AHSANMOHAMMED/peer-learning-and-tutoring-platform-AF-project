import { useState, useCallback } from 'react';
import { socialApi } from '../services/api';
import toast from 'react-hot-toast';

export const useSocial = () => {
  const [feed, setFeed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (filter = 'all', page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await socialApi.getFeed({ filter, page });
      if (res.success) {
        setFeed(res.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await socialApi.getRecommendations();
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  }, []);

  const handlePost = async (content, type = 'status', metadata = {}) => {
    try {
      const res = await socialApi.createPost({ content, type, metadata });
      if (res.success) {
        setFeed(prev => [res.data, ...prev]);
        toast.success('Post shared!');
        return res.data;
      }
    } catch (err) {
      toast.error('Failed to share post');
      throw err;
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await socialApi.follow(userId);
      if (res.success) {
        toast.success(res.message);
        // Refresh recommendations
        fetchRecommendations();
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to follow user');
    }
    return false;
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await socialApi.unfollow(userId);
      if (res.success) {
        toast.success(res.message);
        fetchRecommendations();
        return true;
      }
    } catch (err) {
      toast.error('Failed to unfollow user');
    }
    return false;
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await socialApi.like(postId);
      if (res.success) {
        setFeed(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likes: res.data.isLiked 
                ? [...post.likes, 'currentUser'] // temporary placeholder for UI feedback
                : post.likes.filter(id => id !== 'currentUser') 
              } 
            : post
        ));
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return {
    feed,
    recommendations,
    loading,
    error,
    fetchFeed,
    fetchRecommendations,
    handlePost,
    handleFollow,
    handleUnfollow,
    handleToggleLike
  };
};
