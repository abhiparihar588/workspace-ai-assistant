/**
 * controllers/user.controller.js
 * Manager-only user management: list team, view profiles, deactivate accounts
 */

const User    = require('../models/User');
const WorkLog = require('../models/WorkLog');

// ──────────────────────────────────────────────────────────
// GET /api/users  — List all employees (manager only)
// ──────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (role)       filter.role = role;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      data: users.map(u => u.toPublicJSON()),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/users/:id  — Get a single user's profile + log summary
// ──────────────────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Aggregate log stats for this user
    const stats = await WorkLog.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id:        null,
          totalLogs:  { $sum: 1 },
          totalHours: { $sum: '$hours' },
          avgHours:   { $avg: '$hours' },
        },
      },
    ]);

    // This week's hours
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekStats = await WorkLog.aggregate([
      { $match: { user: user._id, date: { $gte: weekStart } } },
      { $group: { _id: null, weeklyHours: { $sum: '$hours' }, weeklyLogs: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        ...user.toPublicJSON(),
        stats:    stats[0]    || { totalLogs: 0, totalHours: 0, avgHours: 0 },
        weekStats: weekStats[0] || { weeklyHours: 0, weeklyLogs: 0 },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// PUT /api/users/:id  — Update user profile
// ──────────────────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    // Employees can only update themselves; managers can update anyone
    if (req.user.role === 'employee' && req.params.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowedFields = ['name', 'department', 'avatar'];
    // Managers can also change role and isActive
    if (req.user.role === 'manager') {
      allowedFields.push('role', 'isActive');
    }

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Profile updated', data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// DELETE /api/users/:id  — Soft-delete (deactivate) account
// ──────────────────────────────────────────────────────────
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated', data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
// GET /api/users/team-overview  — Aggregated team stats for manager dashboard
// ──────────────────────────────────────────────────────────
exports.getTeamOverview = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true });

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const overview = await Promise.all(
      employees.map(async (emp) => {
        const [all, week] = await Promise.all([
          WorkLog.aggregate([
            { $match: { user: emp._id } },
            { $group: { _id: null, totalHours: { $sum: '$hours' }, totalLogs: { $sum: 1 } } },
          ]),
          WorkLog.aggregate([
            { $match: { user: emp._id, date: { $gte: weekStart } } },
            { $group: { _id: null, weeklyHours: { $sum: '$hours' }, weeklyLogs: { $sum: 1 } } },
          ]),
        ]);
        return {
          ...emp.toPublicJSON(),
          totalHours:  all[0]?.totalHours  || 0,
          totalLogs:   all[0]?.totalLogs   || 0,
          weeklyHours: week[0]?.weeklyHours || 0,
          weeklyLogs:  week[0]?.weeklyLogs  || 0,
        };
      })
    );

    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
};
