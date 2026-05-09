/**
 * routes/auth.routes.js
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * PUT  /api/auth/update-password
 */

const express = require('express');
const router  = express.Router();

const authController = require('../controllers/auth.controller');
const { protect }    = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  verifyEmailRules,
  runValidation,
} = require('../middleware/validate');

// Public routes (with rate limiting)
router.post('/register', authLimiter, registerRules, runValidation, authController.register);
router.post('/login',    authLimiter, loginRules,    runValidation, authController.login);
router.post('/verify-email', authLimiter, verifyEmailRules, runValidation, authController.verifyEmail);
router.post('/google',   authLimiter, authController.googleLogin);

// Protected routes
router.get('/me',              protect, authController.getMe);
router.put('/update-password', protect, authController.updatePassword);

module.exports = router;
