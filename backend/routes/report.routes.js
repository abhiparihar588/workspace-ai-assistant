/**
 * routes/report.routes.js
 * POST   /api/reports/generate   (manager)
 * GET    /api/reports
 * GET    /api/reports/:id
 * DELETE /api/reports/:id        (manager)
 */

const express = require('express');
const router  = express.Router();

const reportController        = require('../controllers/report.controller');
const { protect, authorize }  = require('../middleware/auth');
const { aiLimiter }           = require('../middleware/rateLimiter');
const { reportRules, runValidation } = require('../middleware/validate');

router.use(protect);

router.post(
  '/generate',
  authorize('manager'),
  aiLimiter,
  reportRules,
  runValidation,
  reportController.generateReport
);

router.get('/',    reportController.getReports);
router.get('/:id', reportController.getReport);
router.delete('/:id', authorize('manager'), reportController.deleteReport);

module.exports = router;
