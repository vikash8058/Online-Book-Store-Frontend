import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  getMyAddresses, addAddress,
  updateAddress, deleteAddress, setDefaultAddress
} from '../api/addressApi';
import '../styles/Address.css';

function AddressPage() {
  const { showNotification } = useNotification();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: null,
  });

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const openConfirmDialog = ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm }) => {
    setConfirmDialog({ open: true, title, message, confirmLabel, cancelLabel, onConfirm });
  };

  const emptyForm = {
    fullName: '', phone: '', addressLine: '',
    city: '', state: '', pincode: '', isDefault: false
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAddresses(); }, []);

  async function fetchAddresses() {
    try {
      const data = await getMyAddresses();
      setAddresses(data);
    } catch {
      showNotification('Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(address) {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowForm(true);
  }

  function handleAddNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        showNotification('Address updated!', 'success');
      } else {
        await addAddress(form);
        showNotification('Address added!', 'success');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address';
      showNotification(msg, 'error');
    }
  }

  function handleDelete(id) {
    openConfirmDialog({
      title: 'Delete Address',
      message: 'Do you really want to delete this address? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep address',
      onConfirm: async () => {
        try {
          await deleteAddress(id);
          showNotification('Address deleted', 'success');
          fetchAddresses();
        } catch {
          showNotification('Failed to delete address', 'error');
        } finally {
          closeConfirmDialog();
        }
      },
    });
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultAddress(id);
      showNotification('Default address updated!', 'success');
      fetchAddresses();
    } catch {
      showNotification('Failed to update default', 'error');
    }
  }

  if (loading) return <div className="loading">Loading addresses...</div>;

  return (
    <div className="address-page">
      <div className="address-header">
        <h1>📍 My Addresses</h1>
        <button className="btn-primary" onClick={handleAddNew}>
          + Add New Address
        </button>
      </div>

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <div className="no-address">
          <p>No addresses saved yet.</p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`address-card ${addr.default ? 'default-card' : ''}`}
            >
              {addr.default && (
                <span className="default-badge">✓ Default</span>
              )}
              <p className="addr-name">{addr.fullName}</p>
              <p>{addr.addressLine}</p>
              <p>{addr.city}, {addr.state} — {addr.pincode}</p>
              <p>📞 {addr.phone}</p>
              <div className="address-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(addr)}
                >
                  Edit
                </button>
                {!addr.default && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(addr.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="10 digit number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Address Line</label>
                <input
                  value={form.addressLine}
                  onChange={e => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="House no, Street, Area"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                    placeholder="6 digit pincode"
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                />
                <label htmlFor="isDefault">Set as default address</label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Save Address'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onClose={closeConfirmDialog}
      />
    </div>
  );
}

export default AddressPage;