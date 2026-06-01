import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

// Decoupled Subcomponents
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import UserManagement from './UserManagement';
import ProductConsole from './ProductConsole';
import UserProfile from './UserProfile';

// Decoupled Modals
import CreateUserModal from './CreateUserModal';
import PermissionsModal from './PermissionsModal';
import ProductModal from './ProductModal';

const Dashboard = ({ onShowAlert }) => {
  const { user, isAdmin } = useAuth();

  // Tab control initialized based on user clearance
  const [activeTab, setActiveTab] = useState(() => {
    if (isAdmin) return 'overview';
    const canViewProducts = user.permissions.includes('VIEW_PRODUCTS') || user.permissions.includes('VIEW_STOCK');
    return canViewProducts ? 'products' : 'profile';
  });

  // User list and loading states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Modal display controllers
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Selected records for updates
  const [selectedUserRecord, setSelectedUserRecord] = useState(null);
  const [selectedProductRecord, setSelectedProductRecord] = useState(null);

  // Fetch users if logged in as SUPER ADMIN (isAdmin is true)
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const response = await client.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to load user records from database.', 'danger');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  // Toggle user enabled status
  const handleToggleUserStatus = async (userRecord) => {
    if (userRecord.username === user.username) {
      onShowAlert('You cannot suspend your own active administrator session!', 'danger');
      return;
    }

    try {
      const updatedStatus = !userRecord.enabled;
      await client.put(`/api/users/${userRecord.id}`, { enabled: updatedStatus });
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === userRecord.id ? { ...u, enabled: updatedStatus } : u)
      );
      onShowAlert(`User account '${userRecord.username}' ${updatedStatus ? 'enabled' : 'suspended'} successfully.`, 'success');
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to modify user account status.', 'danger');
    }
  };

  // Delete user account permanently
  const handleDeleteUser = async (userRecord) => {
    if (userRecord.username === user.username) {
      onShowAlert('You cannot delete your own active superadmin profile!', 'danger');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user account '${userRecord.username}'?`)) {
      return;
    }

    try {
      await client.delete(`/api/users/${userRecord.id}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userRecord.id));
      onShowAlert(`User account '${userRecord.username}' deleted successfully.`, 'success');
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to delete user record.', 'danger');
    }
  };

  // Open Permissions Override Modal for a user
  const handleOpenPermissionsModal = (userRecord) => {
    setSelectedUserRecord(userRecord);
    setShowPermissions(true);
  };

  // Open Product Creation / Editing Modal
  const handleOpenProductModal = (productRecord = null) => {
    setSelectedProductRecord(productRecord);
    setShowProductModal(true);
  };

  // Handler for product modification saved
  const handleProductSaved = () => {
    // Dispatch custom event to trigger catalog refresh inside ProductConsole
    const event = new Event('refresh-products');
    window.dispatchEvent(event);
  };

  // Computing stats telemetry for Overview dashboard from live database
  const usersCount = users.length;
  const superAdminsCount = users.filter(u => u.roles.includes('ROLE_SUPER_ADMIN')).length;
  const adminsCount = users.filter(u => u.roles.includes('ROLE_ADMIN')).length;
  const activeUsersCount = users.filter(u => u.enabled).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation Menu */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Panel Space */}
      <main className="main-content">
        {/* Uniform Top Navigation Header with identities and Sign Out */}
        <Header />

        {/* Tab Routing and Telemetry Components */}
        {activeTab === 'overview' && isAdmin && (
          <Overview
            usersCount={usersCount}
            superAdminsCount={superAdminsCount}
            adminsCount={adminsCount}
            activeUsersCount={activeUsersCount}
            onNavigateToTab={setActiveTab}
            onOpenCreateUser={() => setShowCreateUser(true)}
          />
        )}

        {activeTab === 'users' && isAdmin && (
          <UserManagement
            users={users}
            loading={loadingUsers}
            searchTerm={userSearchTerm}
            onSearchChange={setUserSearchTerm}
            onToggleStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onOpenPermissions={handleOpenPermissionsModal}
            onOpenCreateUser={() => setShowCreateUser(true)}
          />
        )}

        {activeTab === 'products' && (
          <ProductConsole
            onShowAlert={onShowAlert}
            onOpenProductModal={handleOpenProductModal}
          />
        )}

        {activeTab === 'profile' && <UserProfile />}
      </main>

      {/* --- FLOATING DIALOGS & FORM OVERLAYS --- */}

      {/* Create User Account Form Modal */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onShowAlert={onShowAlert}
          onUserCreated={fetchUsers}
        />
      )}

      {/* granular Direct Overrides Modal */}
      {showPermissions && selectedUserRecord && (
        <PermissionsModal
          userRecord={selectedUserRecord}
          onClose={() => {
            setShowPermissions(false);
            setSelectedUserRecord(null);
          }}
          onShowAlert={onShowAlert}
          onSaved={fetchUsers}
        />
      )}

      {/* Product Registration & Modifier Modal */}
      {showProductModal && (
        <ProductModal
          productRecord={selectedProductRecord}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProductRecord(null);
          }}
          onShowAlert={onShowAlert}
          onSaved={handleProductSaved}
        />
      )}
    </div>
  );
};

export default Dashboard;
