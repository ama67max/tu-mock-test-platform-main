import React, { useState } from 'react';

const CSV_TEMPLATE = [
  'category_id,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks',
  'existing-category-id,What is 2+2?,1,2,3,4,4,Basic math,EASY,1',
].join('\n');

export default function BulkUploadModal({ isOpen = false, onClose, onUpload, loading = false, errors = [] }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const rows = String(text).split('\n').slice(0, 5);
      setPreview(rows);
    };
    reader.readAsText(file);
  }

  function handleUpload() {
    if (!selectedFile) return;
    onUpload && onUpload(selectedFile);
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
          <div className="rounded border border-surface-variant bg-surface-container-lowest p-3 text-xs text-secondary">
            <div className="font-semibold text-primary">Expected CSV format</div>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-surface p-2 text-xs text-on-surface">{CSV_TEMPLATE}</pre>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li><span className="font-semibold">category_id</span> must be an existing category ID.</li>
              <li><span className="font-semibold">correct_answer</span> must exactly match one of the option values.</li>
              <li><span className="font-semibold">difficulty</span> must be one of <span className="font-semibold">EASY</span>, <span className="font-semibold">MEDIUM</span>, or <span className="font-semibold">HARD</span>.</li>
            </ul>
          </div>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="rounded bg-primary px-3 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Selected CSV'}
            </button>
          </div>
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
