/**
 * models/AIReport.js — AIReports Collection
 * Stores AI-generated productivity reports for employees
 */

const mongoose = require('mongoose');

const AIReportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      enum: ['week', 'month', 'custom', 'all'],
      required: true,
    },
    periodStart: Date,
    periodEnd:   Date,

    // Summary generated from individual log
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkLog',
    },
    reportType: {
      type: String,
      enum: ['summary', 'productivity'],
      required: true,
    },

    content: {
      type: String,
      required: [true, 'Report content is required'],
    },
    logsAnalyzed: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    model: {
      type: String,
      default: 'claude-sonnet-4-20250514',
    },
    promptTokens:     { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

AIReportSchema.index({ employee: 1, createdAt: -1 });

module.exports = mongoose.model('AIReport', AIReportSchema);
