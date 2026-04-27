const express = require('express');
const router = express.Router();
const { 
  registerMentor, 
  getMentors, 
  getMentorProfile, 
  updateMentorProfile,
  moderateMentor
} = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Mentors
 *   description: Mentor registration and management
 */

/**
 * @swagger
 * /api/mentors:
 *   post:
 *     summary: Register as a mentor
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Mentor profile created
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all approved mentors
 *     tags: [Mentors]
 *     responses:
 *       200:
 *         description: List of approved mentors
 */
router.post('/', authenticate, authorize(['mentor']), registerMentor);
router.get('/', getMentors);

/**
 * @swagger
 * /api/mentors/{id}:
 *   get:
 *     summary: Get mentor profile
 *     tags: [Mentors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor profile
 */
router.get('/:id', getMentorProfile);
router.put('/:id', authenticate, authorize(['mentor']), updateMentorProfile);

/**
 * @swagger
 * /api/mentors/{id}/moderate:
 *   put:
 *     summary: Moderate mentor account
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mentor moderated
 */
router.put('/:id/moderate', authenticate, authorize(['websiteAdmin', 'superadmin']), moderateMentor);

module.exports = router;
