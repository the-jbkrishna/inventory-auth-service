import React, { useState } from 'react';
import client from '../api/client';

const ALL_SYSTEM_PERMISSIONS = [
  'VIEW_PRODUCTS', 'CREATE_PRODUCTS', 'UPDATE_PRODUCTS', 'DELETE_PRODUCTS',
  'VIEW_STOCK', 'UPDATE_STOCK',
  'VIEW_ORDERS', 'CREATE_ORDERS', 'DELETE_ORDERS'
];

// Helper to resolve role default permissions
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

const PermissionsModal = ({ userRecord, onClose, onShowAlert, onSaved }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(userRecord.directPermissions || []);
  const [submitting, setSubmitting] = useState(false);

  const handleTogglePermission = (perm) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await client.put(`/api/users/${userRecord.id}/permissions`, {
        permissionNames: selectedPermissions
      });
      onShowAlert(`Direct permissions override updated for '${userRecord.username}'.`, 'success');
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to update direct permission overrides.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ width: '640px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Permissions Override</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Configuring credentials overrides for user: <strong style={{ color: 'var(--text-main)' }}>{userRecord.username}</strong>
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '60vh' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
            Toggle checkboxes below to add direct overrides. **Role Default** options are already enabled and marked in gold below to showcase previous enabled privileges before configuring custom overrides.
          </p>

          <div className="permission-matrix">
            {ALL_SYSTEM_PERMISSIONS.map((perm) => {
              const isInherited = getRoleInheritedPermissions(userRecord.roles).has(perm);
              const isCustomOverride = selectedPermissions.includes(perm);
              const isCurrentlyActive = isInherited || isCustomOverride;
              
              return (
                <div 
                  key={perm}
                  className={`permission-cell ${isCurrentlyActive ? 'active' : ''}`}
                  onClick={() => {
                    if (isInherited) {
                      onShowAlert(`'${perm}' is inherited by default via this user's role group! Override allocation is redundant.`, 'info');
                      return;
                    }
                    handleTogglePermission(perm);
                  }}
                  style={{ 
                    opacity: isInherited ? 0.8 : 1, 
                    cursor: isInherited ? 'not-allowed' : 'pointer',
                    background: isInherited ? 'rgba(var(--primary-rgb), 0.03)' : '',
                    borderColor: isInherited ? 'rgba(var(--primary-rgb), 0.15)' : ''
                  }}
                >
                  <div className="checkbox-indicator" style={{ background: isInherited ? 'rgba(var(--primary-rgb), 0.2)' : '', borderColor: isInherited ? 'var(--primary)' : '' }}>
                    {isInherited ? '🛡️' : isCustomOverride ? '✓' : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="permission-label-code" style={{ color: isInherited ? 'var(--text-muted)' : 'var(--text-main)' }}>{perm}</span>
                    {isInherited ? (
                      <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Inherited from Role
                      </span>
                    ) : isCustomOverride ? (
                      <span style={{ fontSize: '9px', color: 'var(--secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active Direct Override
                      </span>
                    ) : (
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ marginRight: '8px' }}></span> Saving...
              </>
            ) : 'Save Overrides'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
