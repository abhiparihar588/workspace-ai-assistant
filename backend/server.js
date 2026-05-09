/**
 * server.js — Application Entry Point
 * Initializes Express, connects to MongoDB, registers middleware & routes
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const connectDB        = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler     = require('./middleware/errorHandler');

// ── Route imports ──────────────────────────────────────────
const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const logRoutes     = require('./routes/worklog.routes');
const reportRoutes  = require('./routes/report.routes');

// ── Connect Database ───────────────────────────────────────
connectDB();

const app = express();

// Trust proxy for rate limiter (required when behind a proxy/forwarder)
app.set('trust proxy', 1);

// ── Security Middleware ────────────────────────────────────
app.use(helmet());                         // Set secure HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

// ── Parsing Middleware ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

// ── Rate Limiting (global) ─────────────────────────────────
app.use(globalLimiter);

// ── Static Files (uploaded screenshots/docs) ───────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/logs',    logRoutes);
app.use('/api/reports', reportRoutes);

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date() });
});

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`📦  Environment : ${process.env.NODE_ENV}\n`);
});

module.exports = app; // exported for testing
