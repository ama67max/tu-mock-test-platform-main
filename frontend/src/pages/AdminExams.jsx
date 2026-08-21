import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ExamCreator from '../components/admin/ExamCreator';
import * as adminApi from '../api/adminApi';
import { useExams, useExamMutations } from '../hooks/useExams';
import AdminExamDetailModal from '../components/admin/AdminExamDetailModal';

export default function AdminExams() {
  const [creating, setCreating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  
  // Use SWR hook for exams with caching
  const { exams, isLoading } = useExams({});
  const { refreshAllExams } = useExamMutations();

  async function handleCreate(payload) {
    try {
      setCreating(true);
      await adminApi.createExam(payload);
      // Refresh the exams list after creation
      await refreshAllExams();
    } catch (e) {
      console.error('Failed to create exam:', e);
      alert('Failed to create exam: ' + (e.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  }

  const handleDelete = async (exam) => {
    if (!confirm(`Delete exam "${exam.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteExam(exam.id);
      await refreshAllExams();
    } catch (e) {
      console.error('Failed to delete exam:', e);
      alert('Failed to delete exam: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <header className="rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-3xl font-black text-primary">Exam Creator</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Define exam parameters and organize question sets for TU mock tests.
        </p>
      </header>

      {/* Create Exam Form */}
      <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
        <div className="mb-6 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">New Entry</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Create New Exam</h3>
        </div>
        <ExamCreator onSubmit={handleCreate} initial={{}} submitting={creating} />
      </div>

      {/* Exam List */}
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest border border-border shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-surface-variant px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Published</span>
            <h3 className="font-headline text-xl font-bold text-primary mt-0.5">Exam Library</h3>
          </div>
          <span className="bg-surface-container-high border border-surface-variant px-3 py-1 rounded-full text-xs font-bold text-primary">
            {isLoading ? '...' : `${exams.length} Total`}
          </span>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-center text-secondary text-sm">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="px-6 py-8 text-center text-secondary text-sm">No exams created yet. Create your first exam above.</div>
        ) : (
          <ul className="divide-y divide-surface-variant">
            {exams.map((e) => (
              <li key={e.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="font-semibold text-primary text-sm">{e.title}</p>
                  {e.category && <p className="text-xs text-secondary mt-0.5">{e.category.name}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{e.questionsCount ?? 0} Qs</span>
                  <button onClick={() => { setSelectedExamId(e.id); setDetailOpen(true); }} className="text-primary underline">Details</button>
                  <Link to={`/admin/exams/${e.id}/edit`} className="px-2 py-1 border rounded text-sm">Edit</Link>
                  <button onClick={() => handleDelete(e)} className="text-primary text-sm underline-offset-4 hover:underline">Delete exam</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AdminExamDetailModal examId={selectedExamId} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />

      </div>
    </div>
  );
}
