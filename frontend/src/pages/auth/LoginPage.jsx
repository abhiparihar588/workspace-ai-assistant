// src/pages/auth/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components/common/UI';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (codeResponse) => {
    try {
      setLoading(true);
      const user = await googleLogin(codeResponse.credential);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'manager' ? '/manager' : '/employee', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
      setLoading(false);
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'manager' ? '/manager' : '/employee', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg relative overflow-hidden">
      {/* Background Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-[600px] h-[600px] rounded-full top-[-200px] right-[-200px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)' }}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute w-[400px] h-[400px] rounded-full bottom-[-100px] left-[-100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,201,151,0.1) 0%, transparent 70%)' }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#16161e]/80 backdrop-blur-xl border border-border rounded-3xl p-10 w-full max-w-[420px] relative z-10 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-green rounded-xl flex items-center justify-center text-xl shadow-lg">⚡</div>
          <span className="font-['Syne'] text-xl font-bold tracking-tight text-text">WorkSpace AI</span>
        </div>
        
        <h1 className="font-['Syne'] text-3xl font-bold mb-1 text-text">Welcome back</h1>
        <p className="text-text2 text-sm mb-6">Sign in to your workspace assistant</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-red px-4 py-3 rounded-xl text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" id="email" name="email" type="email"
            value={form.email} onChange={handleChange} placeholder="you@company.com" required />
          <Input label="Password" id="password" name="password" type="password"
            value={form.password} onChange={handleChange} placeholder="••••••••" required />



          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" fullWidth loading={loading}>Sign In</Button>
          </motion.div>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-text2 text-sm">or</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed.')}
            useOneTap
            shape="pill"
            theme="filled_black"
          />
        </div>

        <p className="text-center mt-6 text-text2 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent2 transition-colors font-medium">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
