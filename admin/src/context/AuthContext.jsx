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
        
        const storedAdmin = localStorage.getItem('adminInfo');
        if (storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
          // Also normalize the role when loading from localStorage
          const normalizedRole = parsedAdmin.role 
            ? parsedAdmin.role.toLowerCase() === 'superadmin' 
              ? 'superAdmin' 
              : 'admin' 
            : '';
          setAdmin({ ...parsedAdmin, role: normalizedRole });
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
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // 🛠️ Normalizing the role string to camelCase to handle 'SuperAdmin' or 'superAdmin' or 'superadmin'
        const normalizedRole = user.role 
          ? user.role.toLowerCase() === 'superadmin' 
            ? 'superAdmin' 
            : 'admin' 
          : '';
        
        if (normalizedRole !== 'admin' && normalizedRole !== 'superAdmin') {
          throw new Error('Access Denied. Admins only.');
        }

        // Create a copy of the user object with the normalized role
        const updatedUser = { ...user, role: normalizedRole };

        setToken(token);
        setAdmin(updatedUser);
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminInfo', JSON.stringify(updatedUser));
        
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
    // 🔐 Check against lowercase versions to ensure strict match consistency
    isAuthenticated: !!token && (admin?.role === 'admin' || admin?.role === 'superAdmin'),
    isSuperAdmin: admin?.role === 'superAdmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};