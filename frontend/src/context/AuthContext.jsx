import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/auth.js';
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredAuth,
} from '../utils/storage.js';
import { INITIAL_USERS } from '../api/seedData.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      if (!savedToken) {
        // Provide default demo student session on first load so user immediately sees the rich dashboard
        const defaultUser = INITIAL_USERS[1]; // Divya Sharma (Student Leader)
        const defaultToken = btoa(JSON.stringify({ id: defaultUser.id, email: defaultUser.email, role: defaultUser.role }));
        setUser(defaultUser);
        setToken(defaultToken);
        setStoredToken(defaultToken);
        setStoredUser(defaultUser);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getMeApi();
        if (data?.user) {
          setUser(data.user);
          setStoredUser(data.user);
        }
      } catch (err) {
        console.warn('Could not verify token with backend, keeping cached user session', err);
        const cached = getStoredUser();
        if (cached) setUser(cached);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginApi({ email, password });
      setToken(data.token);
      setUser(data.user);
      setStoredToken(data.token);
      setStoredUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await registerApi(userData);
      setToken(data.token);
      setUser(data.user);
      setStoredToken(data.token);
      setStoredUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  const switchDemoUser = (userEmail) => {
    const target = INITIAL_USERS.find((u) => u.email.toLowerCase() === userEmail.toLowerCase()) || INITIAL_USERS[1];
    const dummyToken = btoa(JSON.stringify({ id: target.id, email: target.email, role: target.role }));
    setToken(dummyToken);
    setUser(target);
    setStoredToken(dummyToken);
    setStoredUser(target);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    switchDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
