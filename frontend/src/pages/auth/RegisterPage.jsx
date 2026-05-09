// src/pages/auth/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components/common/UI';

export default function RegisterPage() {
  const { register, verifyEmail, googleLogin } = useAuth();
  const navigate = useNavigate();
  // Role is hardcoded to 'employee' so users cannot self-assign as 'manager'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (codeResponse) => {
    try {
      setLoading(true);
      const user = await googleLogin(codeResponse.credential);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'manager' ? '/manager' : '/employee', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google signup failed.');
      setLoading(false);
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      const user = await verifyEmail(form.email, otp);
      toast.success('Account verified successfully!');
      navigate(user.role === 'manager' ? '/manager' : '/employee', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
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
        className="bg-[#16161e]/80 backdrop-blur-xl border border-border rounded-3xl p-10 w-full max-w-[460px] relative z-10 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-green rounded-xl flex items-center justify-center text-xl shadow-lg">⚡</div>
          <span className="font-['Syne'] text-xl font-bold tracking-tight text-text">WorkSpace AI</span>
        </div>
        
        <h1 className="font-['Syne'] text-3xl font-bold mb-1 text-text">
          {step === 1 ? 'Create account' : 'Verify Email'}
        </h1>
        <p className="text-text2 text-sm mb-6">
          {step === 1 ? "Join your team's workspace assistant" : `Enter the 6-digit code sent to ${form.email}`}
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-red px-4 py-3 rounded-xl text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="register-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRegisterSubmit} 
              className="space-y-4"
            >
              <Input label="Full Name" name="name" type="text" value={form.name}
                onChange={handleChange} placeholder="Jane Smith" required />
              
              <Input label="Email" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@company.com" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Password" name="password" type="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" required />
                <Input label="Department (Optional)" name="department" value={form.department}
                  onChange={handleChange} placeholder="Engineering" />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                <Button type="submit" fullWidth loading={loading}>
                  Create Account
                </Button>
              </motion.div>

              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-text2 text-sm">or</span>
                <div className="h-px bg-border flex-1"></div>
              </div>

              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google signup failed.')}
                  useOneTap
                  shape="pill"
                  theme="filled_black"
                  text="signup_with"
                />
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="verify-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifySubmit} 
              className="space-y-4"
            >
              <Input label="Verification Code" name="otp" type="text" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="123456" required />
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                <Button type="submit" fullWidth loading={loading}>
                  Verify Account
                </Button>
              </motion.div>
              
              <p className="text-center mt-4 text-text2 text-sm">
                Didn't receive a code?{' '}
                <button 
                  type="button" 
                  onClick={handleRegisterSubmit} 
                  className="text-accent hover:text-accent2 transition-colors font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Resend OTP
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {step === 1 && (
          <p className="text-center mt-6 text-text2 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent2 transition-colors font-medium">Sign In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
