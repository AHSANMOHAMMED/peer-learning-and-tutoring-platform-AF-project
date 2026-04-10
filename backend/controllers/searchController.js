const User = require('../models/User');
const Question = require('../models/Question');
const Material = require('../models/Material');

/**
 * Global search across users, questions, and materials
 */
const globalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10, page = 1 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const skip = (page - 1) * limit;
    const searchQuery = q.trim();
    const results = {};

    // Parallel search across all types
    const [users, questions, materials] = await Promise.all([
      type === 'all' || type === 'users' ? searchUsers(searchQuery, { skip, limit }) : [],
      type === 'all' || type === 'questions' ? searchQuestions(searchQuery, { skip, limit }) : [],
      type === 'all' || type === 'materials' ? searchMaterials(searchQuery, { skip, limit }) : []
    ]);

    if (type === 'all' || type === 'users') results.users = users;
    if (type === 'all' || type === 'questions') results.questions = questions;
    if (type === 'all' || type === 'materials') results.materials = materials;

    res.json({
      success: true,
      data: results,
      query: searchQuery
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Search users by username, email, or bio
 */
const searchUsers = async (query, options = {}) => {
  try {
    const { skip = 0, limit = 10 } = options;

    const users = await User.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .select('-password -passwordResetToken -emailVerificationToken')
    .sort({ score: { $meta: 'textScore' } })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .lean();

    return users.map(user => ({
      id: user._id,
      type: 'user',
      name: user.displayName || user.username,
      username: user.username,
      avatar: user.profile.avatar,
      bio: user.profile.bio,
      role: user.role,
      score: user.score
    }));
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
};

/**
 * Search questions
 */
const searchQuestions = async (query, options = {}) => {
  try {
    const { skip = 0, limit = 10 } = options;

    const questions = await Question.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .populate('author', 'profile.firstName profile.lastName username profile.avatar')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .lean();

    return questions.map(q => ({
      id: q._id,
      type: 'question',
      title: q.title,
      description: q.description.substring(0, 100) + '...',
      subject: q.subject,
      difficulty: q.difficulty,
      author: q.author?.username,
      answers: q.answers.length,
      upvotes: q.upvotes,
      views: q.views,
      score: q.score,
      createdAt: q.createdAt
    }));
  } catch (error) {
    console.error('Question search error:', error);
    return [];
  }
};

/**
 * Search materials (study resources)
 */
const searchMaterials = async (query, options = {}) => {
  try {
    const { skip = 0, limit = 10 } = options;

    const materials = await Material.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .populate('uploadedBy', 'profile.firstName profile.lastName username')
    .sort({ score: { $meta: 'textScore' }, downloadCount: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .lean();

    return materials.map(m => ({
      id: m._id,
      type: 'material',
      title: m.title,
      description: m.description.substring(0, 100) + '...',
      fileType: m.type,
      subject: m.subject,
      uploader: m.uploadedBy?.username,
      rating: m.rating?.average || 0,
      downloads: m.downloadCount,
      views: m.viewCount,
      score: m.score,
      createdAt: m.createdAt
    }));
  } catch (error) {
    console.error('Material search error:', error);
    return [];
  }
};

/**
 * Advanced search with filters
 */
const advancedSearch = async (req, res) => {
  try {
    const {
      q,
      type = 'all',
      subject,
      difficulty,
      grade,
      role,
      sortBy = 'relevance',
      limit = 20,
      page = 1
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;
    const results = {};

    // Build search filters
    if (type === 'all' || type === 'users') {
      const userFilters = { $text: { $search: q } };
      if (role) userFilters.role = role;

      const users = await User.find(userFilters)
        .select('-password -passwordResetToken -emailVerificationToken')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      results.users = users;
    }

    if (type === 'all' || type === 'questions') {
      const questionFilters = { $text: { $search: q } };
      if (subject) questionFilters.subject = subject;
      if (difficulty) questionFilters.difficulty = difficulty;

      const questions = await Question.find(questionFilters)
        .populate('author', 'username profile.avatar')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      results.questions = questions;
    }

    if (type === 'all' || type === 'materials') {
      const materialFilters = { $text: { $search: q } };
      if (subject) materialFilters.subject = subject;
      if (grade) materialFilters.grade = parseInt(grade);

      const materials = await Material.find(materialFilters)
        .populate('uploadedBy', 'username')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      results.materials = materials;
    }

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get search suggestions as user types
 */
const searchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { suggestions: [] } });
    }

    const regex = new RegExp(`^${q}`, 'i');

    const [usernames, subjects, tags] = await Promise.all([
      User.find({ username: regex })
        .select('username profile.avatar')
        .limit(5)
        .lean(),
      Material.find({ subject: regex })
        .select('subject')
        .distinct('subject')
        .limit(5),
      Material.find({ tags: { $in: [regex] } })
        .select('tags')
        .distinct('tags')
        .limit(5)
    ]);

    const suggestions = [
      ...usernames.map(u => ({ type: 'user', value: u.username, avatar: u.profile.avatar })),
      ...subjects.map(s => ({ type: 'subject', value: s })),
      ...tags.map(t => ({ type: 'tag', value: t }))
    ];

    res.json({
      success: true,
      data: { suggestions: suggestions.slice(0, 10) }
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

module.exports = {
  globalSearch,
  advancedSearch,
  searchSuggestions,
  searchUsers,
  searchQuestions,
  searchMaterials
};
