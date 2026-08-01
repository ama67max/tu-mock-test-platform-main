import React, { useState } from 'react';
import QuestionUploader from '../components/admin/QuestionUploader';
import BulkUploadModal from '../components/admin/BulkUploadModal';
import * as adminApi from '../api/adminApi';

export default function AdminQuestions() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  async function handleSingle(question) {
    try {
      setLoading(true);
      await adminApi.uploadQuestion(question);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulk(file) {
    try {
      setLoading(true);
      // delegate actual upload to adminApi; here we just call upload endpoint
      const form = new FormData();
      form.append('file', file);
      await adminApi.uploadQuestions?.(form) || adminApi.uploadQuestion?.(form);
    } catch (e) {
      setErrors((p) => p.concat(e.message || 'Upload failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-surface-variant pb-6">
        <h2 className="font-headline text-3xl font-black text-primary">Question Bank</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Upload, manage, and organize exam questions for TU mock test sets.
        </p>
      </header>

      {/* Single Question Upload */}
      <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
        <div className="mb-6 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Single Entry</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Add Question</h3>
        </div>
        <QuestionUploader onSubmit={handleSingle} />
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-variant pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Batch Import</span>
            <h3 className="font-headline text-xl font-bold text-primary mt-1">Bulk Upload Questions</h3>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Upload CSV / JSON
          </button>
        </div>
        <p className="text-xs text-secondary">
          Import multiple questions at once from a CSV or JSON file. Supports bulk Q&A with options A–D and correct answer mapping.
        </p>
      </div>

      <BulkUploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} onUpload={handleBulk} loading={loading} errors={errors} />
    </div>
  );
}
