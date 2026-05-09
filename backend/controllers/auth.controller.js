/**
 * controllers/auth.controller.js
 * Handles registration, login, token refresh, and profile fetching
 */

const jwt  = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: sign JWT ───────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Helper: send token response ───────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toPublicJSON(),
  });
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      // If an existing unverified user tries to register again, we could resend OTP, but let's keep it simple and just say it's registered.
      // Better yet, if it's unverified we could allow re-register. For now, just reject.
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      department,
      otp,
      otpExpires,
      isVerified: false 
    });

    // Send email
    try {
      const message = `Your WorkSpace AI verification code is: ${otp}. It will expire in 15 minutes.`;
      await sendEmail({
        email: user.email,
        subject: 'Verify your email for WorkSpace AI',
        message
      });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for the verification code.',
        email: user.email // send email back for the frontend to know
      });
    } catch (error) {
      console.error('Email send error:', error);
      // Clean up user if email fails to send so they can try again
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' });
    }
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user including password field (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact your admin.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// PUT /api/auth/update-password  (protected)
// ──────────────────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ──────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Email verified successfully. You are now logged in.');
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/google
// ──────────────────────────────────────────────────────────
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is missing' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists. Ensure they are active
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact your admin.' });
      }
      
      // If user signed up locally but is now logging in with Google, 
      // we can optionally link them or just log them in. 
      // For now, we will mark them as verified if they weren't already.
      if (!user.isVerified) {
        user.isVerified = true;
      }
      
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // User doesn't exist, create them
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        role: 'employee',
        avatar: picture || '#6c63ff',
        isVerified: true,
        lastLogin: new Date()
      });
    }

    sendTokenResponse(user, 200, res, 'Google Login successful');
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};
