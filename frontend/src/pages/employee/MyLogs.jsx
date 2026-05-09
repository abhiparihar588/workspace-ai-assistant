// src/pages/employee/MyLogs.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logsAPI } from '../../api/services';
import {
  PageHeader, Card, Badge, Button, AISummaryBox,
  EmptyState, Input, Textarea, Select, Spinner
} from '../../components/common/UI';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function MyLogs() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editLog, setEditLog]     = useState(null);
  const [aiLoading, setAiLoading] = useState({});
  const [saving, setSaving]       = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await logsAPI.getAll({ limit: 50 });
      setLogs(data.data);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work log?')) return;
    try {
      await logsAPI.delete(id);
      toast.success('Log deleted');
      setLogs(l => l.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleAISummary = async (log) => {
    setAiLoading(p => ({ ...p, [log._id]: true }));
    try {
      const { data } = await logsAPI.summarize(log._id);
      setLogs(l => l.map(x => x._id === log._id ? { ...x, aiSummary: data.data.summary } : x));
      toast.success('AI summary generated!');
    } catch { toast.error('AI summary failed'); }
    finally { setAiLoading(p => ({ ...p, [log._id]: false })); }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await logsAPI.update(editLog._id, {
        title: editLog.title,
        description: editLog.description,
        hours: editLog.hours,
        status: editLog.status,
      });
      setLogs(l => l.map(x => x._id === editLog._id ? data.data : x));
      setEditLog(null);
      toast.success('Log updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ color:'var(--text2)', padding:'2rem' }}>Loading…</div>;

  return (
    <div>
      <PageHeader
        title="My Work Logs"
        subtitle="All your submitted work updates"
        action={<Link to="/employee/submit"><Button size="sm">+ New Update</Button></Link>}
      />

      {logs.length === 0 ? (
        <Card>
          <EmptyState icon="📋" title="No work logs yet"
            sub="Start by submitting your first work update"
            action={<Link to="/employee/submit"><Button size="sm">Submit First Update</Button></Link>} />
        </Card>
      ) : (
        <>
          <div style={{ marginBottom:'1rem', color:'var(--text2)', fontSize:13 }}>
            {logs.length} submission{logs.length !== 1 ? 's' : ''}
          </div>
          {logs.map(log => (
            <div key={log._id} style={{
              background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius2)',
              padding:'1.25rem', marginBottom:'.75rem', transition:'border-color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:15, marginBottom:'.3rem' }}>{log.title}</div>
                  <div style={{ display:'flex', gap:'.75rem', fontSize:12, color:'var(--text2)', flexWrap:'wrap' }}>
                    <span style={{ background:'var(--bg3)', border:'1px solid var(--border)', padding:'.15rem .5rem', borderRadius:20 }}>⏱ {log.hours}h</span>
                    <span>{formatDate(log.date)}</span>
                    <span>{timeAgo(log.createdAt)}</span>
                    <Badge variant={log.status === 'completed' ? 'green' : log.status === 'blocked' ? 'red' : 'amber'}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6, marginBottom:'.75rem' }}>
                {log.description}
              </p>

              {log.aiSummary && <AISummaryBox content={log.aiSummary} />}

              <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem', flexWrap:'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => setEditLog({ ...log })}>✎ Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(log._id)}>✕ Delete</Button>
                {!log.aiSummary && (
                  <Button size="sm" variant="success" onClick={() => handleAISummary(log)}
                    disabled={aiLoading[log._id]}>
                    {aiLoading[log._id] ? <><Spinner size={12} /> Generating…</> : '✦ AI Summary'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Edit Modal ── */}
      {editLog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setEditLog(null); }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius3)', padding:'2rem', width:'100%', maxWidth:520 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700 }}>Edit Work Log</h2>
              <button onClick={() => setEditLog(null)} style={{ background:'none', border:'none', color:'var(--text2)', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <Input label="Title" value={editLog.title}
                onChange={e => setEditLog(p => ({ ...p, title: e.target.value }))} required />
              <Textarea label="Description" value={editLog.description} rows={4}
                onChange={e => setEditLog(p => ({ ...p, description: e.target.value }))} required />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <Input label="Hours" type="number" min="0.5" max="24" step="0.5" value={editLog.hours}
                  onChange={e => setEditLog(p => ({ ...p, hours: e.target.value }))} required />
                <Select label="Status" value={editLog.status}
                  onChange={e => setEditLog(p => ({ ...p, status: e.target.value }))}>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </div>
              <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem' }}>
                <Button type="submit" loading={saving}>Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => setEditLog(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
