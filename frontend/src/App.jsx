import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Inner App component that consumes useAuth context
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Custom Toast State
  const [alert, setAlert] = useState(null);

  // Trigger automated toast message fade outs
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
  };

  // 1. Initial boot check loading indicator
  if (loading) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: 'column', gap: '16px' }}>
        <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', color: 'var(--primary)' }}></span>
        <p style={{ color: 'var(--text-muted)', fontWeight: '500', margin: 0 }}>
          Verifying security clearance...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Toast Alert Banner */}
      {alert && (
        <div className="alert-container">
          <div className={`glass-panel alert-card alert-${alert.type}`}>
            <span style={{ fontSize: '18px' }}>
              {alert.type === 'success' ? '✅' : alert.type === 'danger' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="alert-message">{alert.message}</span>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'currentColor', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setAlert(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dynamic UI Routing based on authentication status */}
      {isAuthenticated ? (
        <Dashboard onShowAlert={showAlert} />
      ) : (
        <Login onShowAlert={showAlert} />
      )}
    </>
  );
};

// Main App entrypoint wrapped in AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
