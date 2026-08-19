import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import * as adminApi from '../../api/adminApi';

export default function AdminUserEditModal({ user, isOpen, onClose, onSaved }) {
  const [form, setForm] = useState({ fullName: '', email: '', role: '', isActive: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || user.name || '', email: user.email || '', role: user.role || 'student', isActive: !!user.isActive });
    }
  }, [user]);

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await adminApi.updateUser(user.id, { name: form.fullName, email: form.email, role: form.role, isActive: form.isActive });
      onSaved && onSaved({ ...user, ...form });
      onClose && onClose();
    } catch (e) {
      console.error('Failed to save user:', e);
      alert('Failed to save user: ' + (e.message || 'Unknown'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? `Edit ${user.fullName || user.name}` : 'Edit user'}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-secondary">Full name</label>
          <input value={form.fullName} onChange={handleChange('fullName')} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-secondary">Email</label>
          <input value={form.email} onChange={handleChange('email')} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-secondary">Role</label>
          <select value={form.role} onChange={handleChange('role')} className="w-full px-3 py-2 border rounded">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={handleChange('isActive')} />
          <label className="text-sm text-secondary">Active</label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
