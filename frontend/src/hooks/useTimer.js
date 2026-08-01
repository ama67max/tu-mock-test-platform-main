import { useEffect, useMemo, useState } from 'react';
import { useExamStore } from '../stores/examStore';

const STORAGE_KEY = 'tu_exam_timer';

export function useTimer() {
  const { timeRemainingSeconds, setTimeRemaining, tickTimer, attemptId } = useExamStore();
  const [isRunning, setIsRunning] = useState(Boolean(attemptId));

  useEffect(() => {
    if (!attemptId) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    const savedValue = window.localStorage.getItem(STORAGE_KEY);
    if (savedValue && Number(savedValue) > 0) {
      setTimeRemaining(Number(savedValue));
    }
  }, [attemptId, setTimeRemaining]);

  useEffect(() => {
    if (!isRunning || !attemptId) return undefined;

    window.localStorage.setItem(STORAGE_KEY, String(timeRemainingSeconds));

    const interval = window.setInterval(() => {
      tickTimer();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [attemptId, isRunning, tickTimer, timeRemainingSeconds]);

  useEffect(() => {
    return () => {
      window.localStorage.removeItem(STORAGE_KEY);
    };
  }, []);

  const formattedTime = useMemo(() => {
    const total = Math.max(0, timeRemainingSeconds);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [timeRemainingSeconds]);

  return { timeRemainingSeconds, formattedTime, isRunning };
}

export default useTimer;
