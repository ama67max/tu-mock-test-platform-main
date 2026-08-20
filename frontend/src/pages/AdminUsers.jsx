import React, { useEffect, useState } from 'react';
import UserTable from '../components/admin/UserTable';
import * as adminApi from '../api/adminApi';
import AdminUserEditModal from '../components/admin/AdminUserEditModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await adminApi.getUsers({ page: 1, limit: 50 });
        if (!mounted) return;
        setUsers(res?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  async function handleToggle(id) {
    try {
      await adminApi.updateUser(id, { toggleActive: true });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete user?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const handleSaved = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-variant pb-6">
        <div>
          <h2 className="font-headline text-3xl font-black text-primary">User Management</h2>
          <p className="font-sans text-sm text-secondary mt-1">
            Monitor, edit, and manage student access for the TU mock test platform.
          </p>
        </div>
        <div className="bg-surface-container-high border border-surface-variant px-4 py-2 rounded-lg text-xs font-bold text-primary">
          {loading ? '...' : `${users.length} Users`}
        </div>
      </header>

      {/* User Table */}
      <div className="bg-surface-container-lowest border border-border overflow-hidden">
        <UserTable users={users} loading={loading} onToggleActive={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
      </div>

      <AdminUserEditModal user={editingUser} isOpen={editOpen} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
    </div>
  );
}

