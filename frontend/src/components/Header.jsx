import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '32px', 
      paddingBottom: '16px', 
      borderBottom: '1px solid var(--border-color)' 
    }}>
      <div>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--text-muted)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '1.2px' 
        }}>
          Security Control Panel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Identity:</span>
          <strong style={{ color: 'var(--text-main)', fontSize: '14.5px' }}>{user.username}</strong>
          <span className={`badge ${
            user.role === 'ROLE_SUPER_ADMIN' ? 'badge-super' : 
            user.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-role'
          }`}>
            {user.role.replace('ROLE_', '')}
          </span>
        </div>
      </div>
      
      <button 
        className="btn" 
        onClick={logout} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 16px', 
          fontSize: '13px', 
          fontWeight: '600',
          borderRadius: '8px',
          border: '1px solid rgba(244, 63, 94, 0.25)', 
          color: 'var(--danger)', 
          background: 'rgba(244, 63, 94, 0.05)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(244, 63, 94, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🚪 Sign Out Securely
      </button>
    </header>
  );
};

export default Header;
