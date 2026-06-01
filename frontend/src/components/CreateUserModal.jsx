import React, { useState } from 'react';
import client from '../api/client';

const ALL_SYSTEM_PERMISSIONS = [
  'VIEW_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS', 'DELETE_PRODUCTS',
  'VIEW_STOCK', 'UPDATE_STOCK',
  'VIEW_ORDERS', 'CREATE_ORDERS', 'DELETE_ORDERS'
];

// Helper to resolve role-inherited default privileges
const getRoleInheritedPermissions = (roleNames) => {
  const inherited = new Set();
  if (!roleNames) return inherited;
  
  roleNames.forEach(role => {
    if (role === 'ROLE_SUPER_ADMIN') {
      ALL_SYSTEM_PERMISSIONS.forEach(p => inherited.add(p));
    } else if (role === 'ROLE_ADMIN') {
      const adminDefaults = ['VIEW_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS', 'DELETE_PRODUCTS', 'VIEW_STOCK', 'UPDATE_STOCK'];
      adminDefaults.forEach(p => inherited.add(p));
    } else if (role === 'ROLE_USER') {
      const userDefaults = ['VIEW_PRODUCTS', 'VIEW_STOCK'];
      userDefaults.forEach(p => inherited.add(p));
    }
  });
  return inherited;
};

const CreateUserModal = ({ onClose, onShowAlert, onUserCreated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState(['ROLE_USER']);
  const [showPassword, setShowPassword] = useState(false);
  const [directPermissions, setDirectPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleTogglePermission = (perm) => {
    if (directPermissions.includes(perm)) {
      setDirectPermissions(directPermissions.filter(p => p !== perm));
    } else {
      setDirectPermissions([...directPermissions, perm]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onShowAlert('Please enter both the username and password.', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create User
      const createResponse = await client.post('/api/users', {
        username,
        password,
        enabled: true,
        roleNames: roles
      });
      
      const newUserId = createResponse.data.id;

      // 2. Batch Save Overrides immediately if pre-selected
      if (directPermissions.length > 0) {
        await client.put(`/api/users/${newUserId}/permissions`, {
          permissionNames: directPermissions
        });
      }

      onShowAlert(`User account '${username}' registered successfully!`, 'success');
      onUserCreated();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while creating user.';
      onShowAlert(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ width: '640px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Create User Account</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh' }}>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="new-username">Username</label>
                <input
                  type="text"
                  id="new-username"
                  className="form-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="new-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new-password"
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Security Role Group</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--primary-rgb),0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="radio"
                      name="role"
                      value="ROLE_USER"
                      checked={roles.includes('ROLE_USER')}
                      onChange={() => setRoles(['ROLE_USER'])}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <strong style={{ color: 'var(--text-main)' }}>USER</strong>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Read-only catalog</span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--primary-rgb),0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="radio"
                      name="role"
                      value="ROLE_ADMIN"
                      checked={roles.includes('ROLE_ADMIN')}
                      onChange={() => setRoles(['ROLE_ADMIN'])}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <strong style={{ color: 'var(--warning)' }}>ADMIN</strong>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Catalog & stock edit</span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--primary-rgb),0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="radio"
                      name="role"
                      value="ROLE_SUPER_ADMIN"
                      checked={roles.includes('ROLE_SUPER_ADMIN')}
                      onChange={() => setRoles(['ROLE_SUPER_ADMIN'])}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <strong style={{ color: 'var(--primary)' }}>SUPER ADMIN</strong>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full system access</span>
                </label>
              </div>
            </div>

            {/* DIRECT OVERRIDE OPTIONS SHOWCASE BEFORE CREATION */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '12px' }}>Configure Direct Overrides (Optional)</label>
              <div className="permission-matrix">
                {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                  const isInherited = getRoleInheritedPermissions(roles).has(perm);
                  const isActive = directPermissions.includes(perm);
                  
                  return (
                    <div 
                      key={perm}
                      className={`permission-cell ${isActive || isInherited ? 'active' : ''}`}
                      onClick={() => {
                        if (isInherited) {
                          onShowAlert(`'${perm}' is already active by default for the selected role. No override needed!`, 'info');
                          return;
                        }
                        handleTogglePermission(perm);
                      }}
                      style={{ 
                        opacity: isInherited ? 0.75 : 1, 
                        cursor: isInherited ? 'not-allowed' : 'pointer',
                        background: isInherited ? 'rgba(var(--primary-rgb), 0.01)' : '' 
                      }}
                    >
                      <div className="checkbox-indicator" style={{ background: isInherited ? 'rgba(var(--primary-rgb), 0.15)' : '', borderColor: isInherited ? 'var(--primary)' : '' }}>
                        {isInherited ? '🛡️' : isActive ? '✓' : ''}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="permission-label-code" style={{ color: isInherited ? 'var(--text-muted)' : 'var(--text-main)' }}>{perm}</span>
                        {isInherited && (
                          <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Role Default
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }}></span> Creating...
                </>
              ) : 'Register Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
