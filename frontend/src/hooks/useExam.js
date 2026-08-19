import { useCallback, useMemo, useState } from 'react';
import { useExamStore } from '../stores/examStore';
import { startAttempt, submitAnswer, finishAttempt } from '../api/attemptApi';

export function useExam() {
  const store = useExamStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startExamAttempt = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await startAttempt(payload);
      const attemptData = data?.data ?? data ?? {};
      const exam = attemptData?.exam || attemptData;
      const questions = exam?.questions || attemptData?.questions || exam?.examQuestions || [];
      const durationSeconds =
        attemptData?.durationSeconds ||
        attemptData?.timeRemainingSeconds ||
        (exam?.durationMinutes ? Number(exam.durationMinutes) * 60 : 0);

      if (exam && questions.length > 0) {
        store.startExam({
          exam,
          questions,
          attemptId: attemptData?.id || attemptData?.attemptId || payload.examId,
          durationSeconds,
        });
      }

      return attemptData;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to start exam.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  const saveAnswer = useCallback(async (payload) => {
    try {
      await submitAnswer(payload);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save answer.');
      throw err;
    }
  }, []);

  const submitExam = useCallback(async (payload = {}) => {
    try {
      const timeTakenSec = payload.timeTakenSec ?? 0;
      const { data } = await finishAttempt({
        ...payload,
        timeTakenSec,
      });
      store.resetExam();
      return data?.data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit exam.');
      throw err;
    }
  }, [store]);

  return useMemo(() => ({
    ...store,
    isLoading,
    error,
    startExamAttempt,
    saveAnswer,
    submitExam,
  }), [store, isLoading, error, startExamAttempt, saveAnswer, submitExam]);
}

export default useExam;
