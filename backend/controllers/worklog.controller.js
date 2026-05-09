/**
 * controllers/worklog.controller.js
 * CRUD for work logs + AI-powered summary generation
 */

const WorkLog    = require('../models/WorkLog');
const AIReport   = require('../models/AIReport');
const aiService  = require('../utils/aiService');

// ──────────────────────────────────────────────────────────
// POST /api/logs   — Create a work log
// ──────────────────────────────────────────────────────────
exports.createLog = async (req, res, next) => {
  try {
    const { title, description, hours, date, status, tags } = req.body;

    // Handle uploaded files (from multer middleware)
    const files = req.files
      ? req.files.map(f => ({
          originalName: f.originalname,
          storedName:   f.filename,
          mimetype:     f.mimetype,
          size:         f.size,
          url:          f.path,
        }))
      : [];

    const log = await WorkLog.create({
      user: req.user.id,
      title,
      description,
      hours,
      date,
      status,
      tags: tags ? JSON.parse(tags) : [],
      files,
    });

    res.status(201).json({ success: true, message: 'Work log created', data: log });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/logs   — Get logs (employee sees own; manager sees all)
// Query: ?userId=  &date=  &startDate=  &endDate=  &status=  &page=  &limit=
// ──────────────────────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { userId, date, startDate, endDate, status, page = 1, limit = 20 } = req.query;

    // Build filter query
    const filter = {};

    // Employees can only see their own logs
    if (req.user.role === 'employee') {
      filter.user = req.user.id;
    } else if (userId) {
      filter.user = userId;  // Manager filtering by specific employee
    }

    // Date filters
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0,0,0,0)),
        $lte: new Date(d.setHours(23,59,59,999)),
      };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    if (status) filter.status = status;

    // Pagination
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await WorkLog.countDocuments(filter);

    const logs = await WorkLog.find(filter)
      .populate('user', 'name email avatar role')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/logs/:id
// ──────────────────────────────────────────────────────────
exports.getLog = async (req, res, next) => {
  try {
    const log = await WorkLog.findById(req.params.id).populate('user', 'name email avatar');
    if (!log) return res.status(404).json({ success: false, message: 'Work log not found' });

    // Employees can only view their own logs
    if (req.user.role === 'employee' && log.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// PUT /api/logs/:id
// ──────────────────────────────────────────────────────────
exports.updateLog = async (req, res, next) => {
  try {
    const log = await WorkLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Work log not found' });

    // Only the owner or a manager can update
    if (req.user.role === 'employee' && log.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this log' });
    }

    const { title, description, hours, date, status, tags } = req.body;
    if (title)       log.title       = title;
    if (description) log.description = description;
    if (hours)       log.hours       = hours;
    if (date)        log.date        = date;
    if (status)      log.status      = status;
    if (tags)        log.tags        = JSON.parse(tags);

    // If description changed, clear old AI summary so it can be regenerated
    if (description && description !== log.description) {
      log.aiSummary = '';
    }

    await log.save();
    res.json({ success: true, message: 'Work log updated', data: log });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// DELETE /api/logs/:id
// ──────────────────────────────────────────────────────────
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await WorkLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Work log not found' });

    if (req.user.role === 'employee' && log.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this log' });
    }

    await log.deleteOne();
    res.json({ success: true, message: 'Work log deleted' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/logs/:id/summarize  — Generate AI summary
// ──────────────────────────────────────────────────────────
exports.generateSummary = async (req, res, next) => {
  try {
    const log = await WorkLog.findById(req.params.id).populate('user', 'name');
    if (!log) return res.status(404).json({ success: false, message: 'Work log not found' });

    // Authorization
    if (req.user.role === 'employee' && log.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Call AI service
    const { summary, usage } = await aiService.generateWorkSummary(
      log.description,
      log.user.name
    );

    // Persist summary on the log
    log.aiSummary = summary;
    await log.save();

    // Save AI report record
    await AIReport.create({
      employee:    log.user._id,
      generatedBy: req.user.id,
      period:      'custom',
      logId:       log._id,
      reportType:  'summary',
      content:     summary,
      logsAnalyzed: 1,
      totalHours:  log.hours,
      promptTokens:     usage?.input_tokens     || 0,
      completionTokens: usage?.output_tokens    || 0,
    });

    res.json({ success: true, message: 'AI summary generated', data: { summary } });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/logs/stats  — Aggregated stats for dashboard
// ──────────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.role === 'employee' ? req.user.id : req.query.userId;
    const matchStage = userId ? { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } : {};

    const stats = await WorkLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLogs:  { $sum: 1 },
          totalHours: { $sum: '$hours' },
          avgHours:   { $avg: '$hours' },
        },
      },
    ]);

    // Weekly breakdown (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLogs = await WorkLog.aggregate([
      { $match: { ...matchStage, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          hours: { $sum: '$hours' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { totalLogs: 0, totalHours: 0, avgHours: 0 },
        weeklyBreakdown: weeklyLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};
