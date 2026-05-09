# WorkSpace Assistant — React Frontend

Modern, dark-themed React.js frontend with role-based dashboards, AI summaries, and Recharts analytics.

## Quick Start

```bash
npm install
npm start          # http://localhost:3000
```

Set backend URL in `.env` if different from default:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Pages

### Employee
- `/employee` — Dashboard with stats, bar chart, recent logs
- `/employee/submit` — Submit daily work update (with file upload)
- `/employee/my-logs` — View, edit, delete, AI-summarize own logs
- `/employee/profile` — Update name, department, password

### Manager
- `/manager` — Team overview dashboard, top performers, activity feed
- `/manager/team` — Employee cards with stats, progress bars, AI report button
- `/manager/logs` — All logs with employee/date/status filters + AI summary
- `/manager/reports` — Generate & view AI productivity reports

## Folder Structure
```
src/
├── api/
│   ├── axios.js          # Configured Axios with JWT interceptor
│   └── services.js       # All API call functions
├── context/
│   └── AuthContext.js    # Global auth state (login/register/logout)
├── components/common/
│   ├── AppLayout.jsx     # Sidebar + Outlet shell
│   ├── AppLayout.module.css
│   └── UI.jsx            # Button, Input, Card, Badge, Avatar, etc.
├── pages/
│   ├── auth/             # LoginPage, RegisterPage
│   ├── employee/         # Dashboard, SubmitLog, MyLogs, Profile
│   └── manager/          # Dashboard, Team, WorkLogs, AIReports
└── utils/
    └── helpers.js        # formatDate, timeAgo, initials
```

## Demo Credentials (after seeding backend)
| Role | Email | Password |
|---|---|---|
| Manager | alex@company.com | password123 |
| Employee | sarah@company.com | password123 |
