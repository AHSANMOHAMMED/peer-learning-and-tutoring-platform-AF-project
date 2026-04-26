const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

class SocialService {
  /**
   * Follow a user
   */
  async followUser(followerId, targetId) {
    if (followerId.toString() === targetId.toString()) {
      throw new Error('You cannot follow yourself');
    }

    const [follower, target] = await Promise.all([
      User.findById(followerId),
      User.findById(targetId)
    ]);

    if (!target) throw new Error('Target user not found');

    if (follower.following.includes(targetId)) {
      throw new Error('You are already following this user');
    }

    // Update both users
    follower.following.push(targetId);
    target.followers.push(followerId);

    await Promise.all([follower.save(), target.save()]);

    // Notify target
    await Notification.create({
      userId: targetId,
      type: 'system',
      title: 'New Follower',
      message: `${follower.username} started following you.`,
      priority: 'low',
      actionUrl: `/profile/${follower.username}`
    });

    return { success: true, message: `Now following ${target.username}` };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, targetId) {
    const [follower, target] = await Promise.all([
      User.findById(followerId),
      User.findById(targetId)
    ]);

    if (!target) throw new Error('Target user not found');

    follower.following = follower.following.filter(id => id.toString() !== targetId.toString());
    target.followers = target.followers.filter(id => id.toString() !== followerId.toString());

    await Promise.all([follower.save(), target.save()]);

    return { success: true, message: `Unfollowed ${target.username}` };
  }

  /**
   * Create a post
   */
  async createPost(userId, postData) {
    const post = await Post.create({
      author: userId,
      ...postData
    });

    return post.populate('author', 'username profile.firstName profile.lastName profile.avatar');
  }

  /**
   * Get social feed for a user
   */
  async getFeed(userId, options = {}) {
    const { limit = 20, page = 1, filter = 'all' } = options;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    let query = {};

    if (filter === 'follows') {
      // Posts from people the user follows
      query = { author: { $in: [...user.following, userId] } };
    } else if (filter === 'global') {
      // All public posts
      query = { visibility: 'public' };
    } else {
      // Default: Follows + Global Milestones
      query = {
        $or: [
          { author: { $in: [...user.following, userId] } },
          { visibility: 'public', type: { $in: ['milestone', 'badge'] } }
        ]
      };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('comments.author', 'username profile.firstName profile.lastName profile.avatar');

    return posts;
  }

  /**
   * Like/Unlike a post
   */
  async toggleLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    return { likesCount: post.likes.length, isLiked: index === -1 };
  }

  /**
   * Get recommended peers to follow
   */
  async getRecommendations(userId) {
    const user = await User.findById(userId);
    
    // Simple recommendation: Users in same district or stream who aren't followed
    const recommendations = await User.find({
      _id: { $nin: [...user.following, userId] },
      isActive: true,
      role: 'student',
      $or: [
        { district: user.district },
        { stream: user.stream }
      ]
    })
    .limit(5)
    .select('username profile.firstName profile.lastName profile.avatar district stream');

    return recommendations;
  }
}

module.exports = new SocialService();
