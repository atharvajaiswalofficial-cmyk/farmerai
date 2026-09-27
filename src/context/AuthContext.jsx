import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sahayak_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    async function loadUserSession() {
      const savedToken = localStorage.getItem('sahayak_token');
      if (savedToken) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          setToken(savedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('sahayak_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUserSession();
  }, []);

  const login = (accessToken, userData) => {
    localStorage.setItem('sahayak_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('sahayak_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
