import React, { useState } from 'react';
import ExamCreator from '../components/admin/ExamCreator';
import * as adminApi from '../api/adminApi';
import { useExams } from '../hooks/useExams';
import Modal from '../components/common/Modal';
import AdminExamDetailModal from '../components/admin/AdminExamDetailModal';

export default function AdminExams() {
  const [creating, setCreating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  
  // Use SWR hook for exams with caching
  const { exams, isLoading, refresh } = useExams({});

  async function handleCreate(payload) {
    try {
      setCreating(true);
      await adminApi.createExam(payload);
      // Refresh the exams list after creation
      await refresh();
    } catch (e) {
      console.error('Failed to create exam:', e);
      alert('Failed to create exam: ' + (e.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  }

  const openEdit = async (exam) => {
    // fetch full exam details including questions before opening editor
    try {
      setEditingSubmitting(true);
      const res = await adminApi.getExamQuestions(exam.id);
      // API returns ApiResponse wrapper: { status, data, message } or similar; adminApi returns res.data
      const payload = res?.data || res;
      const examData = payload?.data || payload || {};
      // Normalize the returned structure if controller wraps in ApiResponse
      // getExamQuestions returns { ...exam, questions: [...] }
      setEditingExam(examData);
      setEditOpen(true);
    } catch (e) {
      console.error('Failed to load exam for edit:', e);
      alert('Failed to load exam details: ' + (e.message || 'Unknown error'));
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingExam) return;
    try {
      setEditingSubmitting(true);
      // Separate metadata and question ids — backend expects question assignment via /exams/:id/questions
      const { questionIds, ...meta } = payload;

      // Update metadata if there's anything to update
      if (Object.keys(meta).length > 0) {
        await adminApi.updateExam(editingExam.id, meta);
      }

      // If questionIds provided, replace the exam questions using dedicated endpoint
      if (Array.isArray(questionIds)) {
        await adminApi.setExamQuestions(editingExam.id, questionIds);
      }

      await refresh();
      setEditOpen(false);
      setEditingExam(null);
    } catch (e) {
      console.error('Failed to update exam:', e);
      alert('Failed to update exam: ' + (e.message || 'Unknown error'));
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleDelete = async (exam) => {
    if (!confirm(`Delete exam "${exam.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteExam(exam.id);
      await refresh();
    } catch (e) {
      console.error('Failed to delete exam:', e);
      alert('Failed to delete exam: ' + (e.message || 'Unknown error'));
    }
  };

  const normalizeInitial = (exam) => {
    if (!exam) return {};
    return {
      title: exam.title,
      description: exam.description,
      categoryId: exam.category?.id ?? exam.categoryId ?? exam.category ?? '',
      durationMinutes: exam.durationMinutes ?? exam.duration ?? exam.duration_min ?? 60,
      totalMarks: exam.totalMarks ?? exam.total_marks ?? 100,
      passingMarks: exam.passingMarks ?? exam.passing_marks ?? 50,
      isPublished: !!exam.isPublished,
      startTime: exam.startTime ?? exam.start_time ?? exam.start ?? '',
      endTime: exam.endTime ?? exam.end_time ?? exam.end ?? '',
      questionIds: Array.isArray(exam.questions)
        ? exam.questions.map((q) => (q?.id ? q.id : q))
        : exam.questionIds || exam.question_ids || [],
    };
  };

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
      <div className="bg-surface-container-lowest border border-border p-6">
        <div className="mb-6 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">New Entry</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Create New Exam</h3>
        </div>
        <ExamCreator onSubmit={handleCreate} initial={{}} submitting={creating} />
      </div>

      {/* Exam List */}
      <div className="bg-surface-container-lowest border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant">
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
              <li key={e.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors">
                <div>
                  <p className="font-semibold text-primary text-sm">{e.title}</p>
                  {e.category && <p className="text-xs text-secondary mt-0.5">{e.category.name}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{e.questionsCount ?? 0} Qs</span>
                  <button onClick={() => { setSelectedExamId(e.id); setDetailOpen(true); }} className="text-primary underline">Details</button>
                  <button onClick={() => openEdit(e)} className="px-2 py-1 border rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(e)} className="text-primary text-sm underline-offset-4 hover:underline">Delete exam</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AdminExamDetailModal examId={selectedExamId} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />

        <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditingExam(null); }} title={editingExam ? `Edit ${editingExam.title}` : 'Edit exam'} size="lg">
          {/* Use ExamCreator for editing; it will call onSubmit with updated payload */}
          <ExamCreator onSubmit={handleUpdate} initial={normalizeInitial(editingExam)} submitting={editingSubmitting} />
        </Modal>
      </div>
    </div>
  );
}
