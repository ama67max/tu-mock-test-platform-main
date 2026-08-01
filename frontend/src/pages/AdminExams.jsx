import React, { useEffect, useState } from 'react';
import ExamCreator from '../components/admin/ExamCreator';
import * as adminApi from '../api/adminApi';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await adminApi.getExams?.();
        if (!mounted) return;
        setExams(res?.data?.exams || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  async function handleCreate(payload) {
    try {
      const res = await adminApi.createExam(payload);
      // Extract the exam data from the response
      const examData = res?.data || res;
      setExams((p) => [examData, ...p]);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-surface-variant pb-6">
        <h2 className="font-headline text-3xl font-black text-primary">Exam Creator</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Define exam parameters and organize question sets for TU mock tests.
        </p>
      </header>

      {/* Create Exam Form */}
      <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
        <div className="mb-6 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">New Entry</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Create New Exam</h3>
        </div>
        <ExamCreator onSubmit={handleCreate} initial={{}} />
      </div>

      {/* Exam List */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Published</span>
            <h3 className="font-headline text-xl font-bold text-primary mt-0.5">Exam Library</h3>
          </div>
          <span className="bg-surface-container-high border border-surface-variant px-3 py-1 rounded-full text-xs font-bold text-primary">
            {loading ? '...' : `${exams.length} Total`}
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-secondary text-sm">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="px-6 py-8 text-center text-secondary text-sm">No exams created yet.</div>
        ) : (
          <ul className="divide-y divide-surface-variant">
            {exams.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors">
                <div>
                  <p className="font-semibold text-primary text-sm">{e.title}</p>
                  {e.category && <p className="text-xs text-secondary mt-0.5">{e.category.name}</p>}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  {e.questionsCount ?? 0} Qs
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
