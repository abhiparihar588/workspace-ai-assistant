// src/pages/manager/AIReports.jsx

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportsAPI, usersAPI } from '../../api/services';
import { PageHeader, Card, Badge, Button, Avatar, EmptyState, Select, Spinner } from '../../components/common/UI';
import { formatDate } from '../../utils/helpers';

export default function MgrAIReports() {
  const [reports, setReports]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm]         = useState({ employeeId:'', period:'week' });
  const [output, setOutput]     = useState(null);

  useEffect(() => {
    Promise.all([
      reportsAPI.getAll({ limit:20 }),
      usersAPI.getAll({ role:'employee' }),
    ]).then(([r, u]) => {
      setReports(r.data.data);
      setUsers(u.data.data);
    }).catch(() => toast.error('Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!form.employeeId) { toast.error('Select an employee first'); return; }
    setGenerating(true);
    setOutput(null);
    try {
      const { data } = await reportsAPI.generate(form);
      setOutput(data.data);
      setReports(p => [data.data, ...p]);
      toast.success('Report generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportsAPI.delete(id);
      setReports(p => p.filter(r => r._id !== id));
      if (output?._id === id) setOutput(null);
      toast.success('Report deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="AI Reports" subtitle="Generate AI-powered productivity insights for your team" />

      {/* Generator */}
      <Card style={{ marginBottom:'1.5rem' }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Generate New Report</div>
        <div style={{ display:'flex', gap:'.75rem', alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>Employee</label>
            <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
              style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'.72rem 1rem', color:'var(--text)', fontSize:14, outline:'none' }}>
              <option value="">Choose an employee…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ flex:1, minWidth:150 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>Period</label>
            <select value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}
              style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'.72rem 1rem', color:'var(--text)', fontSize:14, outline:'none' }}>
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
          </div>
          <Button onClick={handleGenerate} loading={generating} style={{ minWidth:160 }}>
            ⬡ Generate Report
          </Button>
        </div>
      </Card>

      {/* Live output */}
      {generating && (
        <Card style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text2)', fontSize:13 }}>
            <Spinner size={18} color="var(--accent2)" />
            Generating AI productivity report…
          </div>
        </Card>
      )}

      {output && (
        <Card style={{ marginBottom:'1.5rem', background:'linear-gradient(135deg,rgba(108,99,255,.06),rgba(34,201,151,.04))', border:'1px solid rgba(108,99,255,.25)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <div>
              <div style={{ fontWeight:600, fontSize:15 }}>{output.employee?.name || 'Employee'}</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>
                {output.logsAnalyzed} logs · {output.totalHours}h total · Generated just now
              </div>
            </div>
            <Badge variant="accent">⬡ AI Report</Badge>
          </div>
          <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-line' }}>{output.content}</div>
        </Card>
      )}

      {/* Saved reports */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><Spinner size={28} color="var(--accent)" /></div>
      ) : reports.length === 0 ? (
        <Card><EmptyState icon="⬡" title="No reports yet" sub="Generate your first AI productivity report above" /></Card>
      ) : (
        <>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'.75rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Saved Reports ({reports.length})</div>
          {reports.map(r => {
            const emp = r.employee;
            return (
              <Card key={r._id} style={{ marginBottom:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.85rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Avatar name={emp?.name} color={emp?.avatar} size={38} />
                    <div>
                      <div style={{ fontWeight:600 }}>{emp?.name}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>
                        {formatDate(r.createdAt)} · {r.logsAnalyzed} logs · {r.totalHours}h · {r.period}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                    <Badge variant="accent">⬡ AI</Badge>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}>Delete</Button>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-line', borderTop:'1px solid var(--border)', paddingTop:'.85rem' }}>
                  {r.content}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
