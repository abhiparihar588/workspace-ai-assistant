/**
 * controllers/report.controller.js
 * AI-powered productivity report generation and retrieval
 */

const WorkLog   = require('../models/WorkLog');
const AIReport  = require('../models/AIReport');
const User      = require('../models/User');
const aiService = require('../utils/aiService');

// ──────────────────────────────────────────────────────────
// POST /api/reports/generate  — Generate a productivity report
// Body: { employeeId, period: 'week'|'month'|'all', startDate?, endDate? }
// ──────────────────────────────────────────────────────────
exports.generateReport = async (req, res, next) => {
  try {
    const { employeeId, period = 'week', startDate, endDate } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Build date range from period
    const dateFilter = {};
    const now = new Date();
    if (period === 'week') {
      dateFilter.$gte = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'custom' && startDate) {
      dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const matchFilter = { user: employee._id };
    if (Object.keys(dateFilter).length) matchFilter.date = dateFilter;

    const logs = await WorkLog.find(matchFilter).sort({ date: -1 });
    if (!logs.length) {
      return res.status(400).json({ success: false, message: 'No work logs found for this period' });
    }

    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);

    // Generate AI productivity report
    const { report, usage } = await aiService.generateProductivityReport(logs, employee.name);

    // Save report to DB
    const aiReport = await AIReport.create({
      employee:         employee._id,
      generatedBy:      req.user.id,
      period,
      periodStart:      dateFilter.$gte,
      periodEnd:        dateFilter.$lte || new Date(),
      reportType:       'productivity',
      content:          report,
      logsAnalyzed:     logs.length,
      totalHours,
      promptTokens:     usage?.input_tokens  || 0,
      completionTokens: usage?.output_tokens || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        ...aiReport.toObject(),
        employee: employee.toPublicJSON(),
        logsAnalyzed: logs.length,
        totalHours,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/reports  — List saved reports
// Query: ?employeeId=  &reportType=  &page=  &limit=
// ──────────────────────────────────────────────────────────
exports.getReports = async (req, res, next) => {
  try {
    const { employeeId, reportType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (reportType) filter.reportType = reportType;

    // Employees can only see their own reports
    if (req.user.role === 'employee') filter.employee = req.user.id;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await AIReport.countDocuments(filter);

    const reports = await AIReport.find(filter)
      .populate('employee',    'name email avatar')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: reports,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/reports/:id  — Get a single report
// ──────────────────────────────────────────────────────────
exports.getReport = async (req, res, next) => {
  try {
    const report = await AIReport.findById(req.params.id)
      .populate('employee',    'name email avatar role')
      .populate('generatedBy', 'name');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    if (req.user.role === 'employee' && report.employee._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// DELETE /api/reports/:id  (manager only)
// ──────────────────────────────────────────────────────────
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await AIReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    next(err);
  }
};
