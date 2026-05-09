# WorkSpace Assistant — Backend API

Production-ready Node.js/Express/MongoDB REST API with JWT auth, role-based access control, file uploads, and Anthropic AI integration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Anthropic Claude (claude-sonnet-4) |
| Uploads | Multer |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |
| Security | Helmet + CORS |

---

## Project Structure

```
workspace-backend/
├── server.js                  # Entry point
├── .env.example               # Environment variable template
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── User.js                # Users collection
│   ├── WorkLog.js             # WorkLogs collection
│   └── AIReport.js            # AIReports collection
├── controllers/
│   ├── auth.controller.js     # Register, login, profile
│   ├── worklog.controller.js  # CRUD + AI summary
│   ├── user.controller.js     # Team management
│   └── report.controller.js   # AI report generation
├── routes/
│   ├── auth.routes.js
│   ├── worklog.routes.js
│   ├── user.routes.js
│   └── report.routes.js
├── middleware/
│   ├── auth.js                # JWT verify + role guard
│   ├── validate.js            # express-validator rules
│   ├── rateLimiter.js         # Global, auth, AI limiters
│   ├── upload.js              # Multer file handler
│   └── errorHandler.js        # Global error handler
├── utils/
│   ├── aiService.js           # Anthropic API integration
│   └── seed.js                # Database seeder
└── uploads/                   # Uploaded files (gitignored)
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values:
# - MONGO_URI      → your MongoDB connection string
# - JWT_SECRET     → a long random string
# - ANTHROPIC_API_KEY → from console.anthropic.com
```

### 3. Seed demo data (optional)
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Sign in, get JWT |
| GET | `/api/auth/me` | JWT | Current user profile |
| PUT | `/api/auth/update-password` | JWT | Change password |

### Work Logs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/logs` | JWT | List logs (own for employee, all for manager) |
| GET | `/api/logs/stats` | JWT | Dashboard stats & weekly breakdown |
| GET | `/api/logs/:id` | JWT | Single log |
| POST | `/api/logs` | JWT | Create log (supports file upload) |
| PUT | `/api/logs/:id` | JWT | Update own log |
| DELETE | `/api/logs/:id` | JWT | Delete own log |
| POST | `/api/logs/:id/summarize` | JWT | Generate AI summary |

Query params for GET /api/logs: `?userId=&date=&startDate=&endDate=&status=&page=&limit=`

### Users (Manager Only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Manager | List all employees |
| GET | `/api/users/team-overview` | Manager | Aggregated team stats |
| GET | `/api/users/:id` | JWT | User profile + log stats |
| PUT | `/api/users/:id` | JWT | Update profile |
| DELETE | `/api/users/:id` | Manager | Deactivate account |

### AI Reports (Manager Only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reports/generate` | Manager | Generate productivity report |
| GET | `/api/reports` | JWT | List saved reports |
| GET | `/api/reports/:id` | JWT | Single report |
| DELETE | `/api/reports/:id` | Manager | Delete report |

---

## Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@co.com","password":"secret123","role":"employee"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@co.com","password":"secret123"}'
# → Returns { token, user }
```

### Submit Work Log
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Fixed Auth Bug" \
  -F "description=Resolved JWT refresh token race condition" \
  -F "hours=5" \
  -F "date=2024-01-20" \
  -F "files=@/path/to/screenshot.png"
```

### Generate AI Summary
```bash
curl -X POST http://localhost:5000/api/logs/LOG_ID/summarize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate AI Productivity Report (Manager)
```bash
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"USER_ID","period":"week"}'
```

---

## Rate Limits

| Route Group | Window | Max Requests |
|---|---|---|
| All routes | 15 min | 200 |
| Login / Register | 15 min | 10 |
| AI generation | 1 hour | 30 per user |

---

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Helmet sets 15 secure HTTP headers
- CORS configured for your frontend origin
- Rate limiting prevents brute force & AI abuse
- Input validation on all POST/PUT routes
- Role-based access control on every route
- Soft-delete (deactivation) instead of hard delete

---

## Connect to the React Frontend

In your React app, set the base URL:
```js
// src/api/axios.js
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
```

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Manager | alex@company.com | password123 |
| Employee | sarah@company.com | password123 |
| Employee | raj@company.com | password123 |
| Employee | emma@company.com | password123 |
