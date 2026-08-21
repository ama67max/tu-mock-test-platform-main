import React, { useEffect, useState } from 'react';
import QuestionUploader from '../components/admin/QuestionUploader';
import BulkUploadModal from '../components/admin/BulkUploadModal';
import * as adminApi from '../api/adminApi';

export default function AdminQuestions() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await adminApi.getAdminCategories();
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
      if (list[0]?.id && !selectedCategoryId) {
        setSelectedCategoryId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }

  async function handleSingle(question) {
    try {
      setLoading(true);
      setErrors([]);
      await adminApi.uploadQuestion(question);
    } catch (e) {
      console.error(e);
      setErrors([e.message || 'Failed to add question']);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulk(file) {
    try {
      setLoading(true);
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
    <div className="mx-auto max-w-[1440px] space-y-6">
      <header className="rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-3xl font-black text-primary">Question Bank</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Upload, manage, and organize exam questions for TU mock test sets.
        </p>
      </header>

      {errors.length > 0 && (
        <div className="rounded-lg border border-primary bg-surface-container-highest p-3 text-sm text-primary">
          {errors.join(', ')}
        </div>
      )}

      <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
        <div className="mb-6 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Single Entry</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Add Question</h3>
        </div>
        <QuestionUploader
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          onSubmit={handleSingle}
        />
      </div>

      <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
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
            Upload question CSV
          </button>
        </div>
        <p className="text-xs text-secondary">
          Import multiple questions at once from a CSV file. The backend expects the exact columns category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, and marks.
        </p>
      </div>

      <BulkUploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} onUpload={handleBulk} loading={loading} errors={errors} />
    </div>
  );
}
