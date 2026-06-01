import React from 'react';
import { useAuth } from '../context/AuthContext';

const ALL_SYSTEM_PERMISSIONS = [
  { name: 'VIEW_PRODUCTS', desc: 'Allows viewing of inventory catalog products' },
  { name: 'CREATE_PRODUCTS', desc: 'Allows registering new products in PostgreSQL' },
  { name: 'UPDATE_PRODUCTS', desc: 'Allows modifying existing product details' },
  { name: 'DELETE_PRODUCTS', desc: 'Allows deleting catalog items permanently' },
  { name: 'VIEW_STOCK', desc: 'Allows viewing raw warehouse stock counts' },
  { name: 'UPDATE_STOCK', desc: 'Allows modifying and stepping stock quantities' },
  { name: 'VIEW_ORDERS', desc: 'Allows reading database order records' },
  { name: 'CREATE_ORDERS', desc: 'Allows placing new transaction orders' },
  { name: 'DELETE_ORDERS', desc: 'Allows archiving or deleting transaction orders' }
];

const UserProfile = () => {
  const { user } = useAuth();

  const userPermissions = user?.permissions || [];
  const cleanRole = user?.role ? user.role.replace('ROLE_', '').replace('_', ' ') : 'USER';

  // Calculate percentage of system access
  const privilegePercent = Math.round((userPermissions.length / ALL_SYSTEM_PERMISSIONS.length) * 100);

  return (
    <div style={{ animation: 'fadeIn var(--transition-normal)' }}>
      <div className="header-row">
        <div>
          <h1 className="page-title">My Account</h1>
          <p className="page-subtitle">Security clearance, role privileges, and credentials assessment</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              color: 'var(--text-inverse)', 
              fontSize: '36px', 
              fontWeight: '700', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-glow-primary)',
              border: '3px solid var(--bg-card)'
            }}
          >
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>

          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>
            {user?.username}
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 24px' }}>
            <span className={`badge ${
              user?.role === 'ROLE_SUPER_ADMIN' ? 'badge-super' : 
              user?.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-role'
            }`} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
              🛡️ {cleanRole}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Account Status:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: '700' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 8px var(--success)' }}></span>
                Active Secure
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Clearance Level:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                {user?.role === 'ROLE_SUPER_ADMIN' ? 'Level 3 (Full Master)' : 
                 user?.role === 'ROLE_ADMIN' ? 'Level 2 (Authorized Edit)' : 'Level 1 (Standard View)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>API Authorization:</span>
              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                {privilegePercent}% System Access
              </span>
            </div>
          </div>

          {/* Access Progress Indicator */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${privilegePercent}%`, 
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Permissions Cloud & Badge Breakdown */}
        <div className="glass-panel" style={{ padding: '32px', background: 'var(--bg-card)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
            Compiled Security Clearance Cloud
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Below is the absolute compiled authorization profile. Authorized permissions are unlocked (green checkmarks) while unassigned privileges remain locked down (padlocks).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ALL_SYSTEM_PERMISSIONS.map((perm) => {
              const hasAccess = userPermissions.includes(perm.name);

              return (
                <div 
                  key={perm.name}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 18px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    background: hasAccess ? 'rgba(var(--primary-rgb), 0.02)' : 'transparent',
                    borderColor: hasAccess ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--border-color)',
                    opacity: hasAccess ? 1 : 0.6,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: hasAccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.05)',
                        color: hasAccess ? 'var(--success)' : 'var(--text-muted)',
                        fontSize: '14px',
                        border: hasAccess ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)'
                      }}
                    >
                      {hasAccess ? '✓' : '🔒'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span 
                        style={{ 
                          fontWeight: '600', 
                          fontSize: '14px', 
                          fontFamily: 'var(--font-mono)',
                          color: hasAccess ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        {perm.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {perm.desc}
                      </span>
                    </div>
                  </div>

                  <span 
                    className={`badge ${hasAccess ? 'badge-success' : 'badge-danger'}`}
                    style={{ 
                      fontSize: '10px', 
                      padding: '4px 8px', 
                      minWidth: '70px', 
                      textAlign: 'center', 
                      justifyContent: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    {hasAccess ? 'Authorized' : 'Restricted'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
