/**
 * middleware/validate.js
 * Request body validation using express-validator
 */

const { body, validationResult } = require('express-validator');

// ── Validation runner — call after rule chains ─────────────
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validation rules ──────────────────────────────────
exports.registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name must be under 80 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['employee', 'manager']).withMessage('Role must be employee or manager'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.verifyEmailRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

// ── Work log validation rules ──────────────────────────────
exports.workLogRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('hours')
    .isFloat({ min: 0.5, max: 24 }).withMessage('Hours must be between 0.5 and 24'),
  body('date')
    .isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('status')
    .optional()
    .isIn(['completed', 'in-progress', 'blocked']).withMessage('Invalid status value'),
];

// ── Report validation rules ────────────────────────────────
exports.reportRules = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isMongoId().withMessage('Invalid employee ID format'),
  body('period')
    .isIn(['week', 'month', 'all', 'custom']).withMessage('Period must be week, month, all, or custom'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid date'),
];
