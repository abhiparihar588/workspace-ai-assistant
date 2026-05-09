/**
 * middleware/rateLimiter.js
 * Express-rate-limit configurations for different route groups
 */

const rateLimit = require('express-rate-limit');

// ── Global limiter — all routes ────────────────────────────
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

// ── Auth limiter — stricter for login/register ─────────────
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,  // Don't count successful logins
});

// ── AI limiter — prevent expensive AI abuse ────────────────
exports.aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI generation limit reached. Please wait an hour before generating more.' },
  keyGenerator: (req) => req.user?.id || req.ip,  // Per-user limit
});
