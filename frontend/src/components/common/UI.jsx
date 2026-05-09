// src/components/common/UI.jsx
// Shared atomic components used across the app

import React from 'react';

/* ── Button ────────────────────────────────────────────── */
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, type = 'button', fullWidth = false
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, border: 'none', borderRadius: 'var(--radius)',
    fontFamily: 'inherit', fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? .65 : 1, transition: 'all .2s',
    width: fullWidth ? '100%' : 'auto',
  };
  const sizes = {
    sm: { padding: '.4rem .9rem', fontSize: 12 },
    md: { padding: '.7rem 1.4rem', fontSize: 14 },
    lg: { padding: '.85rem 2rem', fontSize: 15 },
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff' },
    ghost:   { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
    danger:  { background: 'rgba(239,68,68,.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.3)' },
    success: { background: 'rgba(34,201,151,.12)', color: 'var(--green)', border: '1px solid rgba(34,201,151,.3)' },
    accent:  { background: 'rgba(108,99,255,.15)', color: 'var(--accent2)', border: '1px solid rgba(108,99,255,.3)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

/* ── Input ─────────────────────────────────────────────── */
export function Input({ label, id, error, ...props }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label htmlFor={id} style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>}
      <input id={id} style={{
        width:'100%', background:'var(--bg3)', border:`1px solid ${error?'var(--red)':'var(--border)'}`,
        borderRadius:'var(--radius)', padding:'.72rem 1rem', color:'var(--text)', fontSize:14,
        outline:'none', transition:'border-color .2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      {...props} />
      {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:'.3rem' }}>{error}</div>}
    </div>
  );
}

/* ── Textarea ──────────────────────────────────────────── */
export function Textarea({ label, id, error, rows = 4, ...props }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label htmlFor={id} style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>}
      <textarea id={id} rows={rows} style={{
        width:'100%', background:'var(--bg3)', border:`1px solid ${error?'var(--red)':'var(--border)'}`,
        borderRadius:'var(--radius)', padding:'.72rem 1rem', color:'var(--text)', fontSize:14,
        outline:'none', resize:'vertical', transition:'border-color .2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      {...props} />
      {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:'.3rem' }}>{error}</div>}
    </div>
  );
}

/* ── Select ────────────────────────────────────────────── */
export function Select({ label, id, error, children, ...props }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <label htmlFor={id} style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>}
      <select id={id} style={{
        width:'100%', background:'var(--bg3)', border:`1px solid ${error?'var(--red)':'var(--border)'}`,
        borderRadius:'var(--radius)', padding:'.72rem 1rem', color:'var(--text)', fontSize:14,
        outline:'none', appearance:'none',
      }} {...props}>{children}</select>
      {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:'.3rem' }}>{error}</div>}
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────── */
export function Card({ children, style, padding = '1.5rem' }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius2)', padding, ...style }}>
      {children}
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────── */
export function Badge({ children, variant = 'default' }) {
  const variants = {
    green:   { bg:'rgba(34,201,151,.15)',  color:'var(--green)', border:'1px solid rgba(34,201,151,.3)' },
    amber:   { bg:'rgba(245,158,11,.15)', color:'var(--amber)', border:'1px solid rgba(245,158,11,.3)' },
    accent:  { bg:'rgba(108,99,255,.15)', color:'var(--accent2)', border:'1px solid rgba(108,99,255,.3)' },
    red:     { bg:'rgba(239,68,68,.15)',   color:'var(--red)', border:'1px solid rgba(239,68,68,.3)' },
    default: { bg:'var(--bg3)',            color:'var(--text2)', border:'1px solid var(--border)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'.22rem .6rem', borderRadius:20,
      fontSize:11, fontWeight:600, background:v.bg, color:v.color, border:v.border }}>
      {children}
    </span>
  );
}

/* ── Stat Card ─────────────────────────────────────────── */
export function StatCard({ label, value, sub, color = 'var(--text)', change }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius2)', padding:'1.25rem' }}>
      <div style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.5rem' }}>{label}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:700, color, marginBottom:'.25rem' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text2)' }}>{sub}</div>}
    </div>
  );
}

/* ── Spinner ───────────────────────────────────────────── */
export function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <span style={{
      display:'inline-block', width:size, height:size,
      border:`2px solid rgba(255,255,255,.25)`, borderTopColor:color,
      borderRadius:'50%', animation:'spin .7s linear infinite',
    }} />
  );
}

/* ── Page Header ───────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
      <div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700, marginBottom:'.25rem' }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--text2)', fontSize:13 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────── */
export function EmptyState({ icon = '📋', title, sub, action }) {
  return (
    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text2)' }}>
      <div style={{ fontSize:40, marginBottom:'1rem', opacity:.4 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:500, color:'var(--text)', marginBottom:'.4rem' }}>{title}</div>
      {sub && <div style={{ fontSize:13, marginBottom:'1rem' }}>{sub}</div>}
      {action}
    </div>
  );
}

/* ── AI Summary Box ────────────────────────────────────── */
export function AISummaryBox({ content }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,rgba(108,99,255,.08),rgba(34,201,151,.05))',
      border:'1px solid rgba(108,99,255,.25)', borderRadius:'var(--radius2)',
      padding:'1.1rem', marginTop:'.75rem', position:'relative',
    }}>
      <span style={{
        position:'absolute', top:-9, left:12, background:'var(--bg2)',
        padding:'0 8px', fontSize:10, fontWeight:700, color:'var(--accent2)', letterSpacing:'.05em',
      }}>✦ AI SUMMARY</span>
      <p style={{ color:'var(--text)', fontSize:13, lineHeight:1.7 }}>{content}</p>
    </div>
  );
}

/* ── Avatar ─────────────────────────────────────────────── */
export function Avatar({ name = '', color = '#6c63ff', size = 36 }) {
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:color,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.35, fontWeight:600, color:'#fff', flexShrink:0,
    }}>{initials}</div>
  );
}

// Inject spinner keyframes once
if (typeof document !== 'undefined' && !document.getElementById('ui-keyframes')) {
  const style = document.createElement('style');
  style.id = 'ui-keyframes';
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}
