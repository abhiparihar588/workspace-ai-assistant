// src/pages/manager/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usersAPI, logsAPI } from '../../api/services';
import { StatCard, Card, PageHeader, Badge, Avatar, AISummaryBox } from '../../components/common/UI';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function MgrDashboard() {
  const [team, setTeam]         = useState([]);
  const [recentLogs, setRecent] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [teamRes, logsRes] = await Promise.all([
          usersAPI.getTeamOverview(),
          logsAPI.getAll({ limit: 6 }),
        ]);
        setTeam(teamRes.data.data);
        setRecent(logsRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalHours = team.reduce((s, e) => s + e.totalHours, 0);
  const totalLogs  = team.reduce((s, e) => s + e.totalLogs, 0);
  const avgHours   = team.length ? (totalHours / team.length).toFixed(1) : 0;

  // Simple weekly bars per employee
  const chartData = team.map(e => ({ name: e.name.split(' ')[0], hours: e.weeklyHours }));

  if (loading) return <div style={{ color:'var(--text2)', padding:'2rem' }}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Manager Dashboard" subtitle="Team productivity overview and insights" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard label="Team Members" value={team.length} sub="employees" color="var(--accent2)" />
        <StatCard label="Total Hours" value={totalHours} sub="all time" color="var(--green)" />
        <StatCard label="Work Logs" value={totalLogs} sub="submissions" />
        <StatCard label="Avg Hours/Person" value={avgHours} sub="per employee" color="var(--amber)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'1rem', marginBottom:'1.5rem' }}>
        <Card>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Team Weekly Hours</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} cursor={{ fill:'rgba(34,201,151,.08)' }} />
                <Bar dataKey="hours" fill="var(--green)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)' }}>No data</div>}
        </Card>

        <Card>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Top Performers</div>
          {[...team].sort((a,b) => b.weeklyHours - a.weeklyHours).slice(0,4).map(emp => (
            <div key={emp.id} style={{ marginBottom:'.85rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Avatar name={emp.name} color={emp.avatar} size={26} />
                  <span style={{ fontSize:13, fontWeight:500 }}>{emp.name.split(' ')[0]}</span>
                </div>
                <span style={{ fontSize:12, color:'var(--text2)' }}>{emp.weeklyHours}h</span>
              </div>
              <div style={{ height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100, emp.weeklyHours / 40 * 100)}%`, background:'linear-gradient(90deg,var(--accent),var(--green))', borderRadius:3, transition:'width .6s' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Latest Team Activity</div>
        {recentLogs.map(log => {
          const emp = log.user;
          return (
            <div key={log._id} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius2)', padding:'1rem', marginBottom:'.6rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.4rem' }}>
                <Avatar name={emp?.name} color={emp?.avatar} size={26} />
                <span style={{ fontSize:12, color:'var(--text2)' }}>{emp?.name}</span>
              </div>
              <div style={{ fontWeight:600, marginBottom:'.3rem' }}>{log.title}</div>
              <div style={{ display:'flex', gap:'.75rem', fontSize:12, color:'var(--text2)' }}>
                <span>⏱ {log.hours}h</span>
                <span>{formatDate(log.date)}</span>
                <span>{timeAgo(log.createdAt)}</span>
                <Badge variant="green">Submitted</Badge>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
