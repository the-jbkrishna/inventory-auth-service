import React, { useState, useEffect } from 'react';
import client from '../api/client';

const ProductModal = ({ productRecord, onClose, onShowAlert, onSaved }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!productRecord;

  // Prepopulate form if in edit mode
  useEffect(() => {
    if (productRecord) {
      setName(productRecord.name || '');
      setCategory(productRecord.category || '');
      setPrice(productRecord.price !== undefined ? productRecord.price.toString() : '');
      setStock(productRecord.stock !== undefined ? productRecord.stock.toString() : '');
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
    }
  }, [productRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name.trim() || !category.trim() || price === '' || stock === '') {
      onShowAlert('Please fill in all required fields.', 'danger');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (name.trim().length < 2 || name.trim().length > 100) {
      onShowAlert('Product name must be between 2 and 100 characters.', 'danger');
      return;
    }

    if (category.trim().length < 2 || category.trim().length > 50) {
      onShowAlert('Category must be between 2 and 50 characters.', 'danger');
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      onShowAlert('Price must be a valid number greater than or equal to 0.', 'danger');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      onShowAlert('Stock must be a valid integer greater than or equal to 0.', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        price: priceNum,
        stock: stockNum,
      };

      if (isEditMode) {
        await client.put(`/api/products/${productRecord.id}`, payload);
        onShowAlert(`Product '${payload.name}' updated successfully in PostgreSQL.`, 'success');
      } else {
        await client.post('/api/products', payload);
        onShowAlert(`New product '${payload.name}' registered successfully.`, 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || `Error occurred while saving product.`;
      onShowAlert(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ width: '520px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditMode ? '✏️ Modify Catalog Product' : '📦 Register New Product'}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              {isEditMode
                ? 'Update the product parameters. Changes will update the catalog persistently in the PostgreSQL backend database.'
                : 'Enter details below to establish a new inventory product record. The items will immediately synchronize with the database.'}
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="product-name">Product Name *</label>
              <input
                type="text"
                id="product-name"
                className="form-input"
                placeholder="e.g. Enterprise Router Switch X1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-category">Category *</label>
              <input
                type="text"
                id="product-category"
                className="form-input"
                placeholder="e.g. Networking, Electronics, Hardware"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="product-price">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  id="product-price"
                  className="form-input"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="product-stock">Initial Stock Qty *</label>
                <input
                  type="number"
                  step="1"
                  id="product-stock"
                  className="form-input"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
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
                  <span className="spinner" style={{ marginRight: '8px' }}></span> Saving...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
