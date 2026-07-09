import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          if (data.success) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('userToken');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        toast.success('Login successful!');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // NEW: Dedicated Google Authentication Pipeline Handler
  const loginWithGoogle = async (googleCredentialToken) => {
    try {
      // Sends the raw Google credential string to your Node backend
      const { data } = await api.post('/auth/google', { token: googleCredentialToken });
      
      if (data.success) {
        // Saves your OWN system token, exactly like standard email login does
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        toast.success('Google login successful!');
        return true;
      }
    } catch (error) {
      console.error('Google verification backend error:', error);
      toast.error(error.response?.data?.message || 'Google Authentication failed on server');
      return false;
    }
  };

  const sendOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      if (data.success) {
        toast.success(data.message || 'OTP verification code sent!');
        return { success: true, message: data.message };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to send verification code';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (data.success) {
        toast.success(data.message || 'Email verified successfully!');
        return { success: true, message: data.message };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Invalid verification code';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const sendForgotOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success(data.message || 'Password reset OTP sent!');
        return { success: true, message: data.message };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to send reset OTP';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message || 'Password reset successfully!');
        return { success: true, message: data.message };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to reset password';
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.success) {
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    sendOTP,
    verifyOTP,
    sendForgotOTP,
    resetPassword,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};