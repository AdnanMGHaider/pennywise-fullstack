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
      // Verify token with backend before setting user and token
      verifyToken(storedToken);
    } else {
      setLoading(false); // No token, so not loading session
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  const verifyToken = async (currentToken) => {
    try {
      // Assume an endpoint like /api/auth/me or /api/auth/verify
      // For now, let's try to fetch user profile or a protected lightweight endpoint
      // This endpoint needs to exist on the backend and return user details if token is valid
      const res = await fetch(`${API_URL}/auth/profile`, { // Placeholder endpoint
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
         // Ensure userData has expected fields, e.g., id, username, email
        if (userData && userData.id && userData.username) {
            setUser({id: userData.id, username: userData.username, name: userData.username, email: userData.email });
            setToken(currentToken);
             // Update localStorage if backend returns slightly different/updated user details
            localStorage.setItem('pennywise_user', JSON.stringify({id: userData.id, username: userData.username, name: userData.username, email: userData.email }));
        } else {
            // Response OK but data malformed or not what we expect for a user
            console.warn("AuthContext: verifyToken response OK but user data is not as expected.", userData);
            logout(); // Treat as invalid session
        }
      } else {
        // Token is invalid or expired
        logout(); // This will clear token, user, and redirect via its own logic
      }
    } catch (error) {
      console.error('AuthContext: Error verifying token', error);
      logout(); // Network error or other issues, treat as invalid session
    } finally {
      setLoading(false);
    }
  };

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