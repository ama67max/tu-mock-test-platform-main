import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import * as adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AdminExamDetailModal({ examId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!isOpen || !examId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Try to fetch full exam details via adminApi.getExams (filter by id)
        const res = await adminApi.getExams({ id: examId });
        const payload = res?.data || res;
        let single = null;
        if (Array.isArray(payload)) {
          single = payload.find((x) => String(x.id) === String(examId)) || payload[0];
        } else if (payload?.exams) {
          single = payload.exams.find((x) => String(x.id) === String(examId));
        } else {
          single = payload;
        }

        if (!mounted) return;
        setExam(single || null);

        // If API provides separate questions endpoint, fetch them
        if (single?.id) {
          try {
            const qres = await adminApi.getQuestions({ examId: single.id, limit: 500 });
            const qpayload = qres?.data || qres;
            const qlist = Array.isArray(qpayload) ? qpayload : qpayload?.questions || qpayload?.data || [];
            if (mounted) setQuestions(qlist);
          } catch (e) {
            // ignore question fetch error
            console.warn('Failed to fetch exam questions', e);
          }
        }
      } catch (e) {
        console.error('Failed to load exam details:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [isOpen, examId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exam ? exam.title : 'Exam details'} size="lg">
      {loading ? (
        <div className="py-8"><LoadingSpinner size="sm" label="Loading exam..." /></div>
      ) : !exam ? (
        <div className="py-8 text-center text-secondary">No details available for this exam.</div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-secondary">{exam.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-secondary">Category</p>
              <p className="font-semibold">{exam.category?.name || exam.category || 'Uncategorized'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Questions</p>
              <p className="font-semibold">{questions.length || exam.questionsCount || 0}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Question Preview</h4>
            {questions.length === 0 ? (
              <p className="text-xs text-secondary mt-2">No questions available or unable to load questions.</p>
            ) : (
              <ul className="mt-2 space-y-2 max-h-64 overflow-y-auto border border-surface-variant rounded-lg p-2 bg-surface-container-low">
                {questions.slice(0, 50).map((q) => (
                  <li key={q.id} className="text-sm text-on-surface">{q.questionText || q.text || 'Question'}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
