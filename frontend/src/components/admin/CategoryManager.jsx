import React, { useState } from 'react';

export default function CategoryManager({ categories = [], onCreate, loading = false }) {
  const [name, setName] = useState('');

  function handleCreate(e) {
    e.preventDefault();
    if (!name) return;
    onCreate && onCreate({ name });
    setName('');
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4">
      <form onSubmit={handleCreate} className="flex gap-2 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="px-2 py-1 border rounded flex-1" />
        <button className="px-3 py-1 bg-indigo-600 text-white rounded">Create</button>
      </form>
      {loading ? (
        <div className="text-sm text-gray-500">Loading categories...</div>
      ) : (
        <ul className="text-sm space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="py-1">{c.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
