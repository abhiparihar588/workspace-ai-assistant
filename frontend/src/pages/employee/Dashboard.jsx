// src/pages/employee/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { logsAPI } from '../../api/services';
import { StatCard, Card, PageHeader, Badge, AISummaryBox, Button } from '../../components/common/UI';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function EmpDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          logsAPI.getStats(),
          logsAPI.getAll({ limit: 4 }),
        ]);
        setStats(statsRes.data.data);
        setRecentLogs(logsRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const chartData = stats?.weeklyBreakdown?.map(d => ({
    day: ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d._id] || d._id,
    hours: d.hours,
  })) || [];

  if (loading) return <div style={{ color:'var(--text2)', padding:'2rem' }}>Loading…</div>;

  return (
    <div>
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your productivity overview"
        action={<Link to="/employee/submit"><Button>✦ Submit Update</Button></Link>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard label="Total Hours Logged" value={stats?.summary?.totalHours || 0}
          sub="All time" color="var(--accent2)" />
        <StatCard label="Total Submissions" value={stats?.summary?.totalLogs || 0}
          sub="Work logs" color="var(--green)" />
        <StatCard label="Avg Hours / Log" value={(stats?.summary?.avgHours || 0).toFixed(1)}
          sub="Per submission" color="var(--amber)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        <Card>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Weekly Activity</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                  cursor={{ fill:'rgba(108,99,255,.08)' }}
                />
                <Bar dataKey="hours" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:13 }}>No data this week</div>
          )}
        </Card>

        <Card>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Quick Actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            <Link to="/employee/submit">
              <Button fullWidth style={{ justifyContent:'flex-start' }}>✦ Submit Today's Update</Button>
            </Link>
            <Link to="/employee/my-logs">
              <Button variant="ghost" fullWidth style={{ justifyContent:'flex-start' }}>◉ View All Work Logs</Button>
            </Link>
            <Link to="/employee/profile">
              <Button variant="ghost" fullWidth style={{ justifyContent:'flex-start' }}>⊙ Edit Profile</Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.06em' }}>Recent Submissions</div>
          <Badge variant="accent">{recentLogs.length} recent</Badge>
        </div>
        {recentLogs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--text2)', fontSize:13 }}>No submissions yet. <Link to="/employee/submit" style={{ color:'var(--accent2)' }}>Submit your first update →</Link></div>
        ) : recentLogs.map(log => (
          <div key={log._id} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius2)', padding:'1rem', marginBottom:'.75rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.5rem' }}>
              <div>
                <div style={{ fontWeight:600, marginBottom:'.25rem' }}>{log.title}</div>
                <div style={{ display:'flex', gap:'.75rem', fontSize:12, color:'var(--text2)' }}>
                  <span>⏱ {log.hours}h</span>
                  <span>{formatDate(log.date)}</span>
                  <span>{timeAgo(log.createdAt)}</span>
                </div>
              </div>
              <Badge variant="green">Logged</Badge>
            </div>
            <p style={{ color:'var(--text2)', fontSize:13 }}>{log.description}</p>
            {log.aiSummary && <AISummaryBox content={log.aiSummary} />}
          </div>
        ))}
      </Card>
    </div>
  );
}
