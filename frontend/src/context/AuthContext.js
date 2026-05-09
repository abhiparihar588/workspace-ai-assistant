// src/context/AuthContext.js
// Global authentication state — wraps the entire app

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying stored token

  // On mount: verify existing token and restore user session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('wa_token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        localStorage.removeItem('wa_token');
        localStorage.removeItem('wa_user');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('wa_token', data.token);
    localStorage.setItem('wa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const googleLogin = useCallback(async (token) => {
    const { data } = await authAPI.googleLogin({ token });
    localStorage.setItem('wa_token', data.token);
    localStorage.setItem('wa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    return data; // Wait for OTP verification before setting token
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
    const { data } = await authAPI.verifyEmail({ email, otp });
    localStorage.setItem('wa_token', data.token);
    localStorage.setItem('wa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wa_token');
    localStorage.removeItem('wa_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, verifyEmail, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
