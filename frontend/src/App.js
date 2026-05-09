// src/App.js
// Root component: routing, protected routes, role guards

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Employee pages
import EmpDashboard  from './pages/employee/Dashboard';
import EmpSubmit     from './pages/employee/SubmitLog';
import EmpMyLogs     from './pages/employee/MyLogs';
import EmpProfile    from './pages/employee/Profile';

// Manager pages
import MgrDashboard  from './pages/manager/Dashboard';
import MgrTeam       from './pages/manager/Team';
import MgrLogs       from './pages/manager/WorkLogs';
import MgrAIReports  from './pages/manager/AIReports';

// Layout
import AppLayout from './components/common/AppLayout';

// ── Route guards ───────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />;
  return children;
}

function FullPageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'var(--bg)', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:40, height:40, background:'linear-gradient(135deg,var(--accent),var(--green))',
        borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚡</div>
      <div style={{ color:'var(--text2)', fontSize:13 }}>Loading…</div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background:'var(--bg2)', color:'var(--text)', border:'1px solid var(--border2)', fontSize:13 },
            success: { iconTheme: { primary:'var(--green)', secondary:'var(--bg2)' } },
            error:   { iconTheme: { primary:'var(--red)',   secondary:'var(--bg2)' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Employee */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <AppLayout role="employee" />
            </ProtectedRoute>
          }>
            <Route index           element={<EmpDashboard />} />
            <Route path="submit"   element={<EmpSubmit />} />
            <Route path="my-logs"  element={<EmpMyLogs />} />
            <Route path="profile"  element={<EmpProfile />} />
          </Route>

          {/* Manager */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <AppLayout role="manager" />
            </ProtectedRoute>
          }>
            <Route index          element={<MgrDashboard />} />
            <Route path="team"    element={<MgrTeam />} />
            <Route path="logs"    element={<MgrLogs />} />
            <Route path="reports" element={<MgrAIReports />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
