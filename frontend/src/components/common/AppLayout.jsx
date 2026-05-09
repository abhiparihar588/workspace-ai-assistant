// src/components/common/AppLayout.jsx
// Sidebar + main content shell; renders nested <Outlet />

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AppLayout.module.css';

const EMP_NAV = [
  { to: '/employee',         label: 'Dashboard',     icon: '◈', end: true },
  { to: '/employee/submit',  label: 'Submit Update',  icon: '✦' },
  { to: '/employee/my-logs', label: 'My Work Logs',   icon: '◉' },
  { to: '/employee/profile', label: 'Profile',        icon: '⊙' },
];

const MGR_NAV = [
  { to: '/manager',          label: 'Dashboard',   icon: '◈', end: true },
  { to: '/manager/team',     label: 'Team',        icon: '◉' },
  { to: '/manager/logs',     label: 'Work Logs',   icon: '✦' },
  { to: '/manager/reports',  label: 'AI Reports',  icon: '⬡' },
];

function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function AppLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === 'manager' ? MGR_NAV : EMP_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <span className={styles.logoText}>WorkSpace AI</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>{role === 'manager' ? 'Admin' : 'Workspace'}</div>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div
              className={styles.avatar}
              style={{ background: user?.avatar || '#6c63ff' }}
            >
              {initials(user?.name)}
            </div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
