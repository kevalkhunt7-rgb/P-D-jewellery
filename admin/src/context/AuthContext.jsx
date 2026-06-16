import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  // Setup Axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check login status on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Optionally, you can hit a /api/users/profile or /api/auth/me to validate token
        // For now, if we have user info stored locally we can parse it, or we rely on token validity
        const storedAdmin = localStorage.getItem('adminInfo');
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://p-d-jewellery.onrender.com/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        if (user.role !== 'admin') {
          throw new Error('Access Denied. Admins only.');
        }

        setToken(token);
        setAdmin(user);
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminInfo', JSON.stringify(user));
        
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && admin?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
