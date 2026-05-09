// src/pages/employee/Profile.jsx

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../api/services';
import { Input, Button, Card, PageHeader, Avatar } from '../../components/common/UI';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]         = useState({ name: user?.name || '', department: user?.department || '' });
  const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'' });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersAPI.update(user.id, form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 chars'); return; }
    setSavingPw(true);
    try {
      await authAPI.updatePassword(pwForm);
      toast.success('Password updated!');
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account details and password" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', maxWidth:760 }}>
        <Card>
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'.75rem' }}>
              <Avatar name={user?.name} color={user?.avatar} size={64} />
            </div>
            <div style={{ fontWeight:600, fontSize:15 }}>{user?.name}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:'.2rem' }}>{user?.email}</div>
            <div style={{ fontSize:12, color:'var(--accent2)', marginTop:'.3rem', textTransform:'capitalize' }}>{user?.role}</div>
          </div>
          <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'1rem 0' }} />
          <form onSubmit={handleSave}>
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <Input label="Department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
            <Button type="submit" loading={saving} fullWidth>Save Changes</Button>
          </form>
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:'1.25rem' }}>Change Password</div>
          <form onSubmit={handlePasswordChange}>
            <Input label="Current Password" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
            <Button type="submit" variant="ghost" loading={savingPw} fullWidth>Update Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
