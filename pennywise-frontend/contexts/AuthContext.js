'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('pennywise_user');
    const storedToken = localStorage.getItem('pennywise_token');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        return { success: false, error: 'Invalid credentials' };
      }
      const data = await res.json();
      const accessToken = data.accessToken || data.token;
      const { id, username, email: userEmail } = data;
      setToken(accessToken);
      localStorage.setItem('pennywise_token', accessToken);

      const loggedInUser = { id, username, name: username, email: userEmail };
      setUser(loggedInUser);
      localStorage.setItem('pennywise_user', JSON.stringify(loggedInUser));

      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        return { success: false, error: msg || 'Registration failed' };
      }
      const data = await res.json();
      const accessToken = data.accessToken || data.token;
      const { id, username, email: userEmail } = data;
      setToken(accessToken);
      localStorage.setItem('pennywise_token', accessToken);

      const newUser = { id, username, name: username, email: userEmail };
      setUser(newUser);
      localStorage.setItem('pennywise_user', JSON.stringify(newUser));

      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pennywise_user');
    localStorage.removeItem('pennywise_token');
    router.push('/');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}