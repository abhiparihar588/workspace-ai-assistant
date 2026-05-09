/**
 * models/WorkLog.js — WorkLogs Collection
 * Stores daily work updates submitted by employees
 */

const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    hours: {
      type: Number,
      required: [true, 'Hours worked is required'],
      min: [0.5, 'Minimum 0.5 hours'],
      max: [24,  'Maximum 24 hours'],
    },
    date: {
      type: Date,
      required: [true, 'Work date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'blocked'],
      default: 'completed',
    },
    files: [
      {
        originalName: String,
        storedName:   String,
        mimetype:     String,
        size:         Number,
        url:          String,
      },
    ],
    aiSummary: {
      type: String,
      default: '',
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// ── Compound indexes for common manager queries ────────────
WorkLogSchema.index({ user: 1, date: -1 });
WorkLogSchema.index({ date: -1 });
WorkLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkLog', WorkLogSchema);
