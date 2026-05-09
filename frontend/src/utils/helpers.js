// src/utils/helpers.js

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = 60000, h = 3600000, d = 86400000;
  if (diff < m)  return 'just now';
  if (diff < h)  return `${Math.floor(diff / m)}m ago`;
  if (diff < d)  return `${Math.floor(diff / h)}h ago`;
  return `${Math.floor(diff / d)}d ago`;
}

export function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(str, n = 120) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}
