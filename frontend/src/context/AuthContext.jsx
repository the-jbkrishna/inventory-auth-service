import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on boot
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const permissionsStr = localStorage.getItem('permissions');

    if (accessToken && username) {
      setUser({
        username,
        role,
        permissions: permissionsStr ? JSON.parse(permissionsStr) : [],
      });
    }
    setLoading(false);
  }, []);

  // Set up listener for forced logouts from HTTP interceptors
  useEffect(() => {
    const handleForceLogout = () => {
      clearSession();
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  const clearSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    setUser(null);
  };

  const login = async (username, password) => {
    const response = await client.post('/api/auth/login', { username, password });
    const { accessToken, refreshToken, role, permissions } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    localStorage.setItem('permissions', JSON.stringify(permissions));

    setUser({
      username,
      role,
      permissions: permissions || [],
    });

    return response.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await client.post('/api/auth/logout', { refreshToken });
      } catch (err) {
        console.error('Logout error on backend:', err);
      }
    }
    clearSession();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ROLE_SUPER_ADMIN',
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
