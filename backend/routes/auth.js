const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, getUserProfile, updateUserProfile, sendOTP, verifyOTP, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// --- Standard Auth ---
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *     responses:
 *       201: { description: User registered }
 *       400: { description: Validation error }
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile data }
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile updated }
 */
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- OTP Auth ---
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP code to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: OTP sent }
 */
router.post('/send-otp', sendOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code and login/verify account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200: { description: OTP verified }
 *       400: { description: Invalid or expired OTP }
 */
router.post('/verify-otp', verifyOTP);

// --- Password Management ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

// --- Google OAuth ---
/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302: { description: Redirect to Google }
 */
router.get('/google', (req, res, next) => {
  const { role } = req.query;
  const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to frontend with token in URL (captured by frontend)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

module.exports = router;
