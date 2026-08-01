import React from 'react';

export default function UserTable({ users = [], loading = false, onToggleActive, onDelete, onEdit }) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-4 py-3">{u.fullName || u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">{u.isActive ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3">
                <button onClick={() => onEdit && onEdit(u)} className="text-indigo-600 mr-3">Edit</button>
                <button onClick={() => onToggleActive && onToggleActive(u.id)} className="text-sm mr-3">Toggle</button>
                <button onClick={() => onDelete && onDelete(u.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
