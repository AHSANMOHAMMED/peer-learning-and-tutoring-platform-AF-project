const express = require('express');
const router = express.Router();
const { 
  registerTutor, 
  getTutors, 
  getTutorProfile, 
  getTutorByUserId,
  moderateTutor,
  getAllTutors,
  updateTutorProfile
} = require('../controllers/tutorController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: Tutor registration and discovery
 */

/**
 * @swagger
 * /api/tutors:
 *   post:
 *     summary: Register as a tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tutor profile created successfully
 *   get:
 *     summary: Search and find tutors
 *     tags: [Tutors]
 *     responses:
 *       200:
 *         description: List of available tutors
 */
router.post('/', authenticate, authorize(['tutor', 'mentor']), registerTutor);
router.post('/profile', authenticate, authorize(['tutor', 'mentor']), registerTutor);
router.get('/', getTutors);

/**
 * @swagger
 * /api/tutors/all:
 *   get:
 *     summary: "[Admin] Get all tutors (including inactive)"
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/all', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), getAllTutors);

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     summary: Get tutor profile details
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutor details retrieved
 */
router.get('/:id', getTutorProfile);
router.put('/:id', authenticate, authorize(['tutor', 'mentor', 'admin']), updateTutorProfile);
router.get('/user/:userId', getTutorByUserId);

/**
 * @swagger
 * /api/tutors/{id}/moderate:
 *   put:
 *     summary: "[Admin] Moderate tutor account (verify/suspend)"
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id/moderate', authenticate, authorize('admin', 'websiteAdmin', 'superadmin'), moderateTutor);

module.exports = router;
