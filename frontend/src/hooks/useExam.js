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
      const examData = data?.data;

      if (examData?.exam && examData?.questions) {
        store.startExam({
          exam: examData.exam,
          questions: examData.questions,
          attemptId: examData.attemptId,
          durationSeconds: examData.durationSeconds || examData.exam?.durationMinutes * 60,
        });
      }

      return examData;
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

  const submitExam = useCallback(async (payload) => {
    try {
      const { data } = await finishAttempt(payload);
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
