import React, { useState } from 'react';

export default function BulkUploadModal({ isOpen = false, onClose, onUpload, loading = false, errors = [] }) {
  const [preview, setPreview] = useState(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const rows = String(text).split('\n').slice(0, 5);
      setPreview(rows);
    };
    reader.readAsText(file);
    onUpload && onUpload(file);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded p-4 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Bulk Upload Questions (CSV)</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        <div className="space-y-3">
          <input type="file" accept=".csv" onChange={handleFile} />
          {loading && <div className="text-sm text-gray-500">Uploading...</div>}
          {preview && (
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
              <div className="font-medium mb-1">Preview (first 5 lines)</div>
              <pre className="whitespace-pre-wrap">{preview.join('\n')}</pre>
            </div>
          )}
          {errors && errors.length > 0 && (
            <div className="text-sm text-red-600">{errors.join('; ')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
