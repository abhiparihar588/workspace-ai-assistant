// src/pages/employee/SubmitLog.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logsAPI } from '../../api/services';
import { Input, Textarea, Select, Button, Card, PageHeader } from '../../components/common/UI';

export default function SubmitLog() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '', description: '', hours: '', date: today, status: 'completed',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description  = 'Description is required';
    if (form.description.length < 10) e.description = 'Must be at least 10 characters';
    if (!form.hours || form.hours < 0.5) e.hours = 'Enter valid hours (min 0.5)';
    if (!form.date)               e.date        = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach(f => fd.append('files', f));

    try {
      await logsAPI.create(fd);
      toast.success('Work update submitted!');
      navigate('/employee/my-logs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Submit Work Update" subtitle="Log your tasks, hours, and accomplishments for today" />

      <Card style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Input label="Task Title *" name="title" value={form.title}
              onChange={handleChange} placeholder="e.g. Fixed authentication bug" error={errors.title} />
            <Input label="Date *" name="date" type="date" value={form.date}
              onChange={handleChange} error={errors.date} />
          </div>

          <Textarea label="Description *" name="description" value={form.description}
            onChange={handleChange} rows={5}
            placeholder="Describe what you worked on, challenges faced, and outcomes achieved…"
            error={errors.description} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Input label="Hours Worked *" name="hours" type="number" min="0.5" max="24" step="0.5"
              value={form.hours} onChange={handleChange} placeholder="e.g. 6" error={errors.hours} />
            <Select label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="completed">✅ Completed</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="blocked">🚫 Blocked</option>
            </Select>
          </div>

          {/* File upload */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:'.4rem', textTransform:'uppercase', letterSpacing:'.05em' }}>
              Attach Files (Optional)
            </label>
            <label style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              border:`2px dashed ${files.length > 0 ? 'var(--green)' : 'var(--border)'}`,
              borderRadius:'var(--radius2)', padding:'1.5rem', cursor:'pointer',
              color: files.length > 0 ? 'var(--green)' : 'var(--text2)', fontSize:13,
              background: files.length > 0 ? 'rgba(34,201,151,.04)' : 'transparent',
              transition:'all .2s',
            }}>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" style={{ display:'none' }}
                onChange={e => setFiles(Array.from(e.target.files))} />
              {files.length > 0
                ? <>{files.map(f => <div key={f.name}>📎 {f.name}</div>)}</>
                : <><div style={{ fontSize:24, marginBottom:'.5rem' }}>📎</div>Click to attach screenshots or documents</>}
            </label>
          </div>

          <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'1.5rem 0' }} />

          <div style={{ display:'flex', gap:'.75rem' }}>
            <Button type="submit" loading={loading}>✦ Submit Update</Button>
            <Button type="button" variant="ghost" onClick={() => setForm({ title:'', description:'', hours:'', date:today, status:'completed' })}>
              Clear
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
