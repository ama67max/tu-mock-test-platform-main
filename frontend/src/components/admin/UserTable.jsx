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
    <div className="bg-surface-container-lowest">
      <div className="space-y-3 p-3 md:hidden">
        {users.map((u) => (
          <article key={u.id} className="border border-surface-variant bg-surface-container p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-primary">{u.fullName || u.name}</h3>
                <p className="mt-1 break-words text-xs text-secondary">{u.email}</p>
              </div>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-secondary">{u.role}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-surface-variant pt-3 text-xs">
              <span className={u.isActive ? 'font-semibold text-primary' : 'font-semibold text-secondary'}>{u.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => onEdit && onEdit(u)} className="min-h-11 px-1 font-semibold text-primary underline-offset-4 hover:underline">Edit</button>
                <button onClick={() => onToggleActive && onToggleActive(u.id)} className="min-h-11 px-1 font-semibold text-secondary hover:text-primary">Toggle</button>
                <button onClick={() => onDelete && onDelete(u.id)} className="min-h-11 px-1 font-semibold text-secondary hover:text-primary">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-secondary">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-surface-variant text-primary">
              <td className="px-4 py-3">{u.fullName || u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">{u.isActive ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3">
                <button onClick={() => onEdit && onEdit(u)} className="mr-3 font-semibold text-primary underline-offset-4 hover:underline">Edit</button>
                <button onClick={() => onToggleActive && onToggleActive(u.id)} className="mr-3 font-semibold text-secondary hover:text-primary">Toggle</button>
                <button onClick={() => onDelete && onDelete(u.id)} className="font-semibold text-secondary hover:text-primary">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
