import React, { useState } from 'react';
import UserTable from '../components/admin/UserTable';
import * as adminApi from '../api/adminApi';
import AdminUserEditModal from '../components/admin/AdminUserEditModal';
import { useAdminUsersData } from '../hooks/useAdminData';

export default function AdminUsers() {
  const { users, isLoading: loading, refresh } = useAdminUsersData();

  async function handleToggle(id) {
    try {
      await adminApi.updateUser(id, { toggleActive: true });
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete user?')) return;
    try {
      await adminApi.deleteUser(id);
      await refresh();
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
    refresh();
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:flex-row sm:items-end sm:p-6">
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
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest border border-border shadow-sm">
        <UserTable users={users} loading={loading} onToggleActive={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
      </div>

      <AdminUserEditModal user={editingUser} isOpen={editOpen} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
    </div>
  );
}

