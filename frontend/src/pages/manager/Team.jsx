// src/pages/manager/Team.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usersAPI, reportsAPI } from '../../api/services';
import { PageHeader, Card, Badge, Button, Avatar, StatCard, Spinner } from '../../components/common/UI';

export default function MgrTeam() {
  const navigate = useNavigate();
  const [team, setTeam]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [genLoading, setGenLoading] = useState({});

  useEffect(() => {
    usersAPI.getTeamOverview()
      .then(r => setTeam(r.data.data))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateReport = async (emp) => {
    setGenLoading(p => ({ ...p, [emp.id]: true }));
    try {
      await reportsAPI.generate({ employeeId: emp.id, period: 'week' });
      toast.success(`Report generated for ${emp.name.split(' ')[0]}`);
      navigate('/manager/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Report failed');
    } finally {
      setGenLoading(p => ({ ...p, [emp.id]: false }));
    }
  };

  if (loading) return <div style={{ color:'var(--text2)', padding:'2rem' }}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Team Overview" subtitle={`${team.length} active employee${team.length !== 1 ? 's' : ''}`} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem' }}>
        {team.map(emp => {
          const pct = Math.min(100, Math.round(emp.weeklyHours / 40 * 100));
          return (
            <Card key={emp.id}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem' }}>
                <Avatar name={emp.name} color={emp.avatar} size={50} />
                <div>
                  <div style={{ fontWeight:600, fontSize:15 }}>{emp.name}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:'.1rem' }}>{emp.email}</div>
                  <div style={{ marginTop:'.3rem' }}>
                    <Badge variant="accent">{emp.department || 'General'}</Badge>
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.75rem', marginBottom:'1rem' }}>
                {[
                  { label:'Total Logs', value:emp.totalLogs, color:'var(--accent2)' },
                  { label:'Total Hours', value:emp.totalHours, color:'var(--green)' },
                  { label:'This Week', value:emp.weeklyHours, color:'var(--amber)' },
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--bg3)', borderRadius:'var(--radius)', padding:'.6rem', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:10, color:'var(--text3)', marginTop:'.1rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:'.3rem', display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)' }}>
                <span>Weekly target</span><span>{pct}%</span>
              </div>
              <div style={{ height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden', marginBottom:'1rem' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--accent),var(--green))', borderRadius:3, transition:'width .6s' }} />
              </div>

              <div style={{ display:'flex', gap:'.5rem' }}>
                <Button size="sm" variant="ghost" style={{ flex:1 }}
                  onClick={() => navigate(`/manager/logs?userId=${emp.id}`)}>
                  View Logs
                </Button>
                <Button size="sm" variant="success" style={{ flex:1 }}
                  onClick={() => handleGenerateReport(emp)}
                  disabled={genLoading[emp.id]}>
                  {genLoading[emp.id] ? <><Spinner size={12} /> Generating…</> : '⬡ AI Report'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
