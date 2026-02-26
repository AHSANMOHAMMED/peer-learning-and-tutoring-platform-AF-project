const express = require('express');
const router = express.Router();
const { 
  globalSearch, 
  advancedSearch, 
  searchSuggestions 
} = require('../controllers/searchController');
const { apiLimiter } = require('../middleware/security');

/**
 * @route   GET /api/search
 * @desc    Global search across all types
 * @access  Public
 * @query   {string} q - Search query
 * @query   {string} type - Type of results (all, users, questions, materials)
 * @query   {number} limit - Results per page (default: 10)
 * @query   {number} page - Page number (default: 1)
 */
router.get('/', apiLimiter, globalSearch);

/**
 * @route   GET /api/search/advanced
 * @desc    Advanced search with filters
 * @access  Public
 * @query   {string} q - Search query
 * @query   {string} type - Type of results
 * @query   {string} subject - Filter by subject
 * @query   {string} difficulty - Filter by difficulty
 * @query   {number} grade - Filter by grade
 * @query   {string} role - Filter users by role
 * @query   {string} sortBy - Sort by (relevance, recent, popular)
 * @query   {number} limit - Results per page
 * @query   {number} page - Page number
 */
router.get('/advanced', apiLimiter, advancedSearch);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions as user types
 * @access  Public
 * @query   {string} q - Partial search query
 */
router.get('/suggestions', apiLimiter, searchSuggestions);

module.exports = router;
