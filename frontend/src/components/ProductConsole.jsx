import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const ProductConsole = ({ onShowAlert, onOpenProductModal }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Check permissions dynamically
  const canViewProducts = user.permissions.includes('VIEW_PRODUCTS') || user.permissions.includes('VIEW_STOCK');
  const canCreateProducts = user.permissions.includes('CREATE_PRODUCTS');
  const canUpdateProducts = user.permissions.includes('UPDATE_PRODUCTS');
  const canDeleteProducts = user.permissions.includes('DELETE_PRODUCTS');
  const canViewStock = user.permissions.includes('VIEW_STOCK');
  const canUpdateStock = user.permissions.includes('UPDATE_STOCK');

  const fetchProducts = async () => {
    if (!canViewProducts) return;
    setLoading(true);
    try {
      const response = await client.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to load catalog products from PostgreSQL.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Add event listener to refresh product catalog when changes occur in modals
    window.addEventListener('refresh-products', fetchProducts);
    return () => {
      window.removeEventListener('refresh-products', fetchProducts);
    };
  }, [canViewProducts]);

  // Adjust stock via direct PostgreSQL updates
  const handleAdjustStock = async (prod, delta) => {
    const newStock = prod.stock + delta;
    if (newStock < 0) {
      onShowAlert('Stock quantity cannot drop below zero!', 'danger');
      return;
    }

    try {
      // Direct REST API put call to update stock in database!
      await client.put(`/api/products/${prod.id}`, {
        name: prod.name,
        category: prod.category,
        price: prod.price,
        stock: newStock
      });
      
      setProducts(products.map(p => p.id === prod.id ? { ...p, stock: newStock, updatedBy: user.username } : p));
      onShowAlert(`Stock updated for '${prod.name}' (${delta > 0 ? '+' : ''}${delta}).`, 'success');
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to adjust stock count in database.', 'danger');
    }
  };

  // Delete product from PostgreSQL database
  const handleDelete = async (prod) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${prod.name}' from the inventory catalog?`)) {
      return;
    }

    try {
      await client.delete(`/api/products/${prod.id}`);
      setProducts(products.filter(p => p.id !== prod.id));
      onShowAlert(`Product '${prod.name}' deleted successfully.`, 'success');
    } catch (err) {
      console.error(err);
      onShowAlert('Failed to delete product from database.', 'danger');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Products & Stock</h1>
          <p className="page-subtitle">Fully persistent catalog & live warehouse monitor (PostgreSQL connected)</p>
        </div>
        {canCreateProducts ? (
          <button className="btn btn-primary" onClick={() => onOpenProductModal(null)}>
            ➕ Add New Product
          </button>
        ) : (
          <span className="badge badge-success" style={{ opacity: 0.7 }}>
            🔒 View-Only Clearance
          </span>
        )}
      </div>

      {/* Persistent Statistics Widget */}
      <div className="stats-grid">
        <div className="glass-panel stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--secondary)' }}>
          <div className="stat-info">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Total Catalog Items</span>
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-info">
            <span className="stat-value" style={{ color: products.filter(p => p.stock < 40).length > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {products.filter(p => p.stock < 40).length}
            </span>
            <span className="stat-label">Low Stock Alerts (&lt; 40)</span>
          </div>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--success)' }}>
          <div className="stat-info">
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              ${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Warehouse Value</span>
          </div>
        </div>
      </div>

      {/* Filter Search Header */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search products by name or category..."
          style={{ maxWidth: '360px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="btn btn-secondary" onClick={() => setSearch('')}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <span className="spinner" style={{ fontSize: '32px', marginBottom: '16px' }}></span>
          <p>Fetching database catalog records...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p>No inventory items matched your search criteria.</p>
        </div>
      ) : (
        <div className="glass-panel table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Last Modified By</th>
                {(canUpdateProducts || canDeleteProducts) && <th>Catalog Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{prod.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        PROD-ID: #{prod.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-role" style={{ fontSize: '11px' }}>
                      {prod.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                      ${prod.price.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {/* Dynamic Stock Adjustments */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {canUpdateStock ? (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '12px', minWidth: '24px', height: '24px' }}
                          onClick={() => handleAdjustStock(prod, -5)}
                          title="Subtract 5 units"
                        >
                          -
                        </button>
                      ) : null}
                      
                      <span 
                        className={`badge ${prod.stock < 40 ? 'badge-danger' : 'badge-success'}`}
                        style={{ 
                          fontSize: '12px', 
                          minWidth: '40px', 
                          display: 'inline-flex', 
                          justifyContent: 'center', 
                          fontWeight: '700',
                          boxShadow: prod.stock < 40 ? '0 0 10px rgba(244,63,94,0.1)' : 'none'
                        }}
                      >
                        {canViewStock ? prod.stock : '🔒 Locked'}
                      </span>

                      {canUpdateStock ? (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '12px', minWidth: '24px', height: '24px' }}
                          onClick={() => handleAdjustStock(prod, 5)}
                          title="Add 5 units"
                        >
                          +
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} title="You do not have UPDATE_STOCK permission">
                          🔒
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      👤 {prod.updatedBy}
                    </span>
                  </td>
                  {(canUpdateProducts || canDeleteProducts) && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canUpdateProducts && (
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => onOpenProductModal(prod)}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {canDeleteProducts && (
                          <button 
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(244,63,94,0.1)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' }}
                            onClick={() => handleDelete(prod)}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductConsole;
