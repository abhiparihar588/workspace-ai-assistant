// src/pages/manager/WorkLogs.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logsAPI, usersAPI } from '../../api/services';
import { PageHeader, Card, Badge, Button, Avatar, AISummaryBox, EmptyState, Spinner, Input, Select } from '../../components/common/UI';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function MgrWorkLogs() {
  const [searchParams] = useSearchParams();
  const [logs, setLogs]     = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState({});
  const [filter, setFilter] = useState({
    userId: searchParams.get('userId') || '',
    date: '',
    status: '',
  });
  const [pagination, setPagination] = useState({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (filter.userId) params.userId = filter.userId;
      if (filter.date)   params.date   = filter.date;
      if (filter.status) params.status = filter.status;
      const { data } = await logsAPI.getAll(params);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    usersAPI.getAll({ role: 'employee' }).then(r => setUsers(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAISummary = async (log) => {
    setAiLoading(p => ({ ...p, [log._id]: true }));
    try {
      const { data } = await logsAPI.summarize(log._id);
      setLogs(l => l.map(x => x._id === log._id ? { ...x, aiSummary: data.data.summary } : x));
      toast.success('AI summary generated!');
    } catch { toast.error('AI summary failed'); }
    finally { setAiLoading(p => ({ ...p, [log._id]: false })); }
  };

  return (
    <div>
      <PageHeader title="Work Logs" subtitle="All employee submissions with filters" />

      {/* Filters */}
      <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <select value={filter.userId}
          onChange={e => setFilter(f => ({ ...f, userId: e.target.value }))}
          style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'.6rem .9rem', color:'var(--text)', fontSize:13, outline:'none', flex:1, minWidth:160 }}>
          <option value="">All Employees</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <input type="date" value={filter.date}
          onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
          style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'.6rem .9rem', color:'var(--text)', fontSize:13, outline:'none', flex:1, minWidth:140 }} />

        <select value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'.6rem .9rem', color:'var(--text)', fontSize:13, outline:'none', flex:1, minWidth:140 }}>
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="blocked">Blocked</option>
        </select>

        <Button variant="ghost" size="sm" onClick={() => setFilter({ userId:'', date:'', status:'' })}>
          Clear
        </Button>
      </div>

      <Card style={{ marginBottom:'1rem', padding:'.7rem 1.25rem' }}>
        <span style={{ fontSize:13, color:'var(--text2)' }}>
          {loading ? 'Loading…' : `${pagination.total || logs.length} log${pagination.total !== 1 ? 's' : ''} found`}
        </span>
      </Card>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><Spinner size={28} color="var(--accent)" /></div>
      ) : logs.length === 0 ? (
        <Card><EmptyState icon="🔍" title="No logs found" sub="Try adjusting your filters" /></Card>
      ) : (
        logs.map(log => {
          const emp = log.user;
          return (
            <div key={log._id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius2)', padding:'1.25rem', marginBottom:'.75rem', transition:'border-color .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>

              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.5rem' }}>
                <Avatar name={emp?.name} color={emp?.avatar} size={26} />
                <span style={{ fontSize:12, color:'var(--text2)' }}>{emp?.name}</span>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.5rem' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:15, marginBottom:'.3rem' }}>{log.title}</div>
                  <div style={{ display:'flex', gap:'.75rem', fontSize:12, color:'var(--text2)', flexWrap:'wrap' }}>
                    <span>⏱ {log.hours}h</span>
                    <span>{formatDate(log.date)}</span>
                    <span>{timeAgo(log.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={log.status === 'completed' ? 'green' : log.status === 'blocked' ? 'red' : 'amber'}>
                  {log.status}
                </Badge>
              </div>

              <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6 }}>{log.description}</p>
              {log.aiSummary && <AISummaryBox content={log.aiSummary} />}

              {!log.aiSummary && (
                <div style={{ marginTop:'.75rem' }}>
                  <Button size="sm" variant="success" onClick={() => handleAISummary(log)}
                    disabled={aiLoading[log._id]}>
                    {aiLoading[log._id] ? <><Spinner size={12} /> Generating…</> : '✦ Generate AI Summary'}
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
