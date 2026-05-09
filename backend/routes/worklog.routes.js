/**
 * routes/worklog.routes.js
 * GET    /api/logs
 * GET    /api/logs/stats
 * GET    /api/logs/:id
 * POST   /api/logs
 * PUT    /api/logs/:id
 * DELETE /api/logs/:id
 * POST   /api/logs/:id/summarize
 */

const express = require('express');
const router  = express.Router();

const logController           = require('../controllers/worklog.controller');
const { protect, authorize }  = require('../middleware/auth');
const { aiLimiter }           = require('../middleware/rateLimiter');
const { workLogRules, runValidation } = require('../middleware/validate');
const upload                  = require('../middleware/upload');

// All log routes require authentication
router.use(protect);

router.get('/stats',       logController.getStats);
router.get('/',            logController.getLogs);
router.get('/:id',         logController.getLog);

router.post(
  '/',
  upload.array('files', 3),    // Accept up to 3 file uploads
  workLogRules,
  runValidation,
  logController.createLog
);

router.put('/:id', workLogRules, runValidation, logController.updateLog);
router.delete('/:id',      logController.deleteLog);

// AI summary — per-user rate limited
router.post('/:id/summarize', aiLimiter, logController.generateSummary);

module.exports = router;
