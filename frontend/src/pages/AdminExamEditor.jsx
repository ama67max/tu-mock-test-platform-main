import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ExamCreator from '../components/admin/ExamCreator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as adminApi from '../api/adminApi';

export function normalizeExamForEditor(exam) {
  if (!exam) return {};

  return {
    title: exam.title || '',
    description: exam.description || '',
    categoryId: exam.category?.id || exam.categoryId || '',
    durationMinutes: exam.durationMinutes || 60,
    totalMarks: exam.totalMarks || 100,
    passingMarks: exam.passingMarks || 50,
    isPublished: Boolean(exam.isPublished),
    startTime: exam.startTime || '',
    endTime: exam.endTime || '',
    questionIds: Array.isArray(exam.questions)
      ? exam.questions.map((question) => question?.id || question).filter(Boolean)
      : [],
  };
}

export default function AdminExamEditor() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      try {
        const result = await adminApi.getExamQuestions(examId);
        if (!cancelled) setExam(result?.data || result);
      } catch (error) {
        if (!cancelled) toast.error(error.message || 'Failed to load exam');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadExam();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  async function handleUpdate(payload) {
    const { questionIds, ...metadata } = payload;
    setSubmitting(true);
    try {
      await adminApi.updateExam(examId, metadata);
      await adminApi.setExamQuestions(examId, questionIds);
      toast.success('Exam updated successfully');
      navigate('/admin/exams');
    } catch (error) {
      toast.error(error.message || 'Failed to update exam');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete exam "${exam?.title}"? This cannot be undone.`)) return;

    try {
      await adminApi.deleteExam(examId);
      toast.success('Exam deleted successfully');
      navigate('/admin/exams');
    } catch (error) {
      toast.error(error.message || 'Failed to delete exam');
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading exam" />;
  }

  if (!exam) {
    return (
      <div className="space-y-4">
        <p className="text-secondary">Exam could not be found.</p>
        <Link to="/admin/exams" className="text-primary underline">Back to exams</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-surface-variant pb-6">
        <div>
          <Link to="/admin/exams" className="mb-3 inline-flex items-center gap-2 text-sm text-secondary hover:text-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to exams
          </Link>
          <h2 className="font-headline text-3xl font-black text-primary">Edit Exam</h2>
          <p className="mt-1 text-sm text-secondary">Update exam details, availability, and assigned questions.</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete exam
        </button>
      </header>

      <ExamCreator
        key={exam.id}
        initial={normalizeExamForEditor(exam)}
        onSubmit={handleUpdate}
        submitting={submitting}
      />
    </div>
  );
}