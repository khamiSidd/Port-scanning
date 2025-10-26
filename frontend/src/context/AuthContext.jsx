import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(authService.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState(authService.getLastLogin());

  // This effect runs on app load to validate any existing token
  // For a more secure app, you'd also verify this token with the backend
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setToken(token);
      setIsAuthenticated(true);
      setLastLogin(authService.getLastLogin());
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setLastLogin(data.lastLogin);
      setIsAuthenticated(true);
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.register(email, password);
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    setIsLoading(true);
    try {
      const data = await authService.verifyOtp(email, otp);
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setLastLogin(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    isAuthenticated,
    isLoading,
    lastLogin,
    login,
    register,
    verifyOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};