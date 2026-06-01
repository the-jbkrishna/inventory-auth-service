import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout, isAdmin } = useAuth();
  
  // Custom Light & Dark Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Apply data-theme attribute on <html> element reactively
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const canViewProducts = user.permissions.includes('VIEW_PRODUCTS') || user.permissions.includes('VIEW_STOCK');

  return (
    <div className="sidebar">
      <div className="brand-section">
        <div className="brand-icon">I</div>
        <span className="brand-title">Inventory Hub</span>
      </div>

      <nav className="nav-menu">
        {isAdmin && (
          <>
            <div 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => onTabChange('overview')}
            >
              <span className="nav-icon">📊</span> Overview
            </div>
            <div 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => onTabChange('users')}
            >
              <span className="nav-icon">👥</span> User Directory
            </div>
          </>
        )}
        
        {canViewProducts && (
          <div 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => onTabChange('products')}
          >
            <span className="nav-icon">📦</span> Products & Stock
          </div>
        )}

        <div 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
        >
          <span className="nav-icon">👤</span> My Account
        </div>
      </nav>

      {/* Dynamic Theme Toggle Widget */}
      <div className="theme-toggle-container">
        <span className="theme-toggle-label">Interface Mode</span>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Switch UI Theme">
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Sidebar Profile Badge */}
      <div className="user-badge-container">
        <div className="user-avatar">
          {user.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="user-meta">
          <span className="user-meta-name">{user.username}</span>
          <span className="user-meta-role">{user.role.replace('ROLE_', '')}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out Securely">
          🚪
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
