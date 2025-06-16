import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLogoutMutation } from '../features/api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const tokenUtils = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize auth state from tokens
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const accessToken = tokenUtils.getAccessToken();
      const refreshToken = tokenUtils.getRefreshToken();
      if (!accessToken || !refreshToken) {
        setLoading(false);
        setAuthInitialized(true);
        return;
      }
      if (tokenUtils.isTokenExpired(accessToken)) {
        // Optionally, refresh token logic here
        setUser(null);
      } else {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
      setAuthInitialized(true);
    };
    initializeAuth();
  }, []);

  // Sync user/auth state from localStorage when it changes (Redux login, other tabs, etc)
  useEffect(() => {
    const syncAuth = () => {
      const accessToken = tokenUtils.getAccessToken();
      const savedUser = localStorage.getItem('user');
      if (accessToken && savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', syncAuth);
    const interval = setInterval(syncAuth, 1000);
    return () => {
      window.removeEventListener('storage', syncAuth);
      clearInterval(interval);
    };
  }, []);

  const [logoutApi] = useLogoutMutation();
  const logout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      // Optionally log or handle API error, but still clear tokens
      console.error('Logout API error:', error);
    }
    setUser(null);
    tokenUtils.clearTokens();
  };


  const value = {
    user,
    logout,
    loading,
    authInitialized,
    isAuthenticated: () => {
      const token = tokenUtils.getAccessToken();
      return !!user && !!token && !tokenUtils.isTokenExpired(token);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
