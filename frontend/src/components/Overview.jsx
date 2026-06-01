import React from 'react';
import { useAuth } from '../context/AuthContext';

const Overview = ({ usersCount, superAdminsCount, adminsCount, activeUsersCount, onNavigateToTab, onOpenCreateUser }) => {
  const { user } = useAuth();

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Console Dashboard</h1>
          <p className="page-subtitle">Real-time stats telemetry & database controls</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-icon primary">👥</div>
          <div className="stat-info">
            <span className="stat-value">{usersCount}</span>
            <span className="stat-label">Total Accounts</span>
          </div>
        </div>
        
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="stat-icon secondary">🛡️</div>
          <div className="stat-info">
            <span className="stat-value">{superAdminsCount}</span>
            <span className="stat-label">Super Admins</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="stat-icon secondary" style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            ⚙️
          </div>
          <div className="stat-info">
            <span className="stat-value">{adminsCount}</span>
            <span className="stat-label">Administrators</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="stat-icon primary" style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)' }}>
            ✓
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeUsersCount}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>
      </div>

      <div className="glass-panel profile-card" style={{ background: 'radial-gradient(circle at top right, rgba(var(--primary-rgb), 0.04), transparent)' }}>
        <h3 className="profile-section-title">Console System Overview</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Welcome back, **{user.username}**. You are logged in with maximum database clearance. You can edit security groups, customize direct permission overrides, and inspect warehouse listings dynamically.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-primary" onClick={onOpenCreateUser}>
            ➕ Register New User
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigateToTab('users')}>
            👥 Inspect User Database
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigateToTab('products')}>
            📦 Inspect Stock Listings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
