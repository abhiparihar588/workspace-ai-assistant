/**
 * utils/seed.js
 * Seed the database with demo users and work logs
 * Run: node utils/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const WorkLog  = require('../models/WorkLog');
const AIReport = require('../models/AIReport');

const connectDB = require('../config/db');

const users = [
  { name: 'Abhishek',  email: 'abhiparihar89382@gmail.com',  password: 'password123', role: 'manager',  avatar: '#6c63ff', department: 'Engineering' },
  { name: 'Sarah Chen',   email: 'sarah@company.com',  password: 'password123', role: 'employee', avatar: '#22c997', department: 'Engineering' },
  { name: 'Raj Patel',    email: 'raj@company.com',    password: 'password123', role: 'employee', avatar: '#f59e0b', department: 'Engineering' },
  { name: 'Emma Wilson',  email: 'emma@company.com',   password: 'password123', role: 'employee', avatar: '#ef4444', department: 'Design' },
];

const makeLog = (userId, title, description, hours, daysAgo) => ({
  user: userId,
  title,
  description,
  hours,
  date: new Date(Date.now() - daysAgo * 86400000),
  status: 'completed',
  files: [],
  aiSummary: '',
});

async function seed() {
  await connectDB();

  console.log('🧹  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    WorkLog.deleteMany({}),
    AIReport.deleteMany({}),
  ]);

  console.log('👤  Creating users...');
  const createdUsers = await User.create(users);
  const [, sarah, raj, emma] = createdUsers;

  console.log('📋  Creating work logs...');
  await WorkLog.create([
    makeLog(sarah._id, 'Auth System Refactor',      'Refactored JWT authentication, fixed token expiry bugs, implemented refresh token rotation for improved security', 6, 3),
    makeLog(sarah._id, 'API Optimization',           'Optimized MongoDB queries with indexing, reduced average API response time by 40%, fixed N+1 query issues', 5, 2),
    makeLog(sarah._id, 'Code Review & PR Merges',    'Reviewed 8 pull requests, merged 5 approved PRs, provided detailed feedback on architecture decisions', 3, 1),
    makeLog(raj._id,   'Dashboard UI Development',   'Built responsive dashboard with Chart.js, integrated real-time WebSocket updates, fixed mobile breakpoints', 7, 3),
    makeLog(raj._id,   'Unit & Integration Testing',  'Wrote 45 unit tests for auth module, set up Jest + Supertest for integration testing, improved coverage from 65% to 85%', 4, 2),
    makeLog(raj._id,   'Bug Fixes Sprint',            'Resolved 12 bugs from the backlog including critical data race condition in payment processing module', 5, 1),
    makeLog(emma._id,  'Design System Creation',      'Created comprehensive component library with 40+ reusable components, defined typography scale, color tokens and spacing system', 8, 3),
    makeLog(emma._id,  'User Research & Wireframes',  'Conducted 6 user interviews, synthesized findings into 3 personas, created low-fi wireframes for onboarding redesign', 6, 2),
  ]);

  console.log(`\n✅  Seeded ${createdUsers.length} users and 8 work logs`);
  console.log('\n🔑  Demo credentials:');
  console.log('   Manager  → abhiparihar8938@gmail.com  / password123');
  console.log('   Employee → sarah@company.com / password123\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
