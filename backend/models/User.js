/**
 * models/User.js — Users Collection
 * Stores employee and manager accounts with hashed passwords
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === 'local';
        },
        'Password is required'
      ],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,   // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      default: 'employee',
    },
    avatar: {
      type: String,   // hex color string for UI avatar
      default: '#6c63ff',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,   // adds createdAt, updatedAt
  }
);

// ── Indexes ────────────────────────────────────────────────
UserSchema.index({ role: 1 });

// ── Pre-save: hash password ────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ─────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public object ───────────────────
UserSchema.methods.toPublicJSON = function () {
  return {
    id:         this._id,
    name:       this.name,
    email:      this.email,
    role:       this.role,
    avatar:     this.avatar,
    department: this.department,
    isActive:   this.isActive,
    authProvider: this.authProvider,
    lastLogin:  this.lastLogin,
    createdAt:  this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
