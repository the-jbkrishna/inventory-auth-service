import React from 'react';

const UserManagement = ({ users, loading, searchTerm, onSearchChange, onToggleStatus, onDeleteUser, onOpenPermissions, onOpenCreateUser }) => {
  
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">User Directory</h1>
          <p className="page-subtitle">Configure accounts, security roles, and granular direct overrides</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenCreateUser}>
          ➕ Create User
        </button>
      </div>

      {/* Filter Search Header */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search accounts by username..."
          style={{ maxWidth: '360px' }}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button className="btn btn-secondary" onClick={() => onSearchChange('')}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <span className="spinner" style={{ fontSize: '32px', marginBottom: '16px' }}></span>
          <p>Loading database directory records...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No user accounts matched your search keyword.</p>
        </div>
      ) : (
        <div className="glass-panel table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>User Info</th>
                <th>Account Status</th>
                <th>Assigned Roles</th>
                <th>Direct Overrides</th>
                <th>Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userRecord) => (
                <tr key={userRecord.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                        {userRecord.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{userRecord.username}</span>
                    </div>
                  </td>
                  <td>
                    {/* Interactive Toggle Switch */}
                    <div 
                      className={`switch-control ${userRecord.enabled ? 'active' : ''}`}
                      onClick={() => onToggleStatus(userRecord)}
                      title={userRecord.enabled ? 'Click to Suspend Account' : 'Click to Activate Account'}
                    >
                      <div className="switch-track">
                        <div className="switch-thumb"></div>
                      </div>
                      <span style={{ marginLeft: '12px', fontSize: '13px', fontWeight: '500', color: userRecord.enabled ? 'var(--success)' : 'var(--danger)' }}>
                        {userRecord.enabled ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {userRecord.roles.map(r => (
                      <span 
                        key={r} 
                        className={`badge ${r === 'ROLE_SUPER_ADMIN' ? 'badge-super' : r === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-role'}`}
                        style={{ marginRight: '4px' }}
                      >
                        {r.replace('ROLE_', '')}
                      </span>
                    ))}
                  </td>
                  <td>
                    {userRecord.directPermissions && userRecord.directPermissions.length > 0 ? (
                      <div style={{ maxWidth: '280px', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        {userRecord.directPermissions.map(p => (
                          <span key={p} className="badge-permission">{p}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        None (Role default)
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => onOpenPermissions(userRecord)}
                      >
                        🔑 Permissions Override
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(244,63,94,0.1)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' }}
                        onClick={() => onDeleteUser(userRecord)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
