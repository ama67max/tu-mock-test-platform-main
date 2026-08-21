/**
 * SWR Hooks for Exam Data
 * Provides cached, reactive exam data fetching
 */

import useSWR from 'swr';
import { examsFetcher, examDetailFetcher } from '../utils/fetchers';
import SWR_CONFIG from './swrConfig';

// ── SWR Configuration ────────────────────────────────────────────────────────
// ── useExams Hook ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch and cache the list of available exams
 * @param {Object} params - Query parameters (categoryId, isPublished, page, limit)
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { exams, isLoading, error, refresh }
 */
export function useExams(params = {}, options = {}) {
  // Create a stable cache key based on params
  const cacheKey = params ? ['exams', JSON.stringify(params)] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    cacheKey,
    () => examsFetcher(params),
    {
      ...SWR_CONFIG,
      ...options,
    }
  );

  return {
    exams: data || [],
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useExam Hook ──────────────────────────────────────────────────────────────

/**
 * Hook to fetch and cache a single exam's details
 * @param {string|number} examId - Exam ID
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { exam, isLoading, error, refresh }
 */
export function useExam(examId, options = {}) {
  const cacheKey = examId ? `exam:${examId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => examDetailFetcher(examId),
    {
      ...SWR_CONFIG,
      ...options,
    }
  );

  return {
    exam: data,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useExamWithQuestions Hook ─────────────────────────────────────────────────

/**
 * Hook to fetch exam with questions (for taking an exam)
 * Uses a longer stale time since questions don't change during exam
 * @param {string|number} examId - Exam ID
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { exam, questions, isLoading, error, refresh }
 */
export function useExamWithQuestions(examId, options = {}) {
  const cacheKey = examId ? `exam:questions:${examId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      // Import dynamically to avoid circular deps
      const { default: axiosInstance } = await import('../api/axiosConfig');
      const res = await axiosInstance.get(`/exams/${examId}/questions`);
      return res?.data?.data || res?.data || null;
    },
    {
      ...SWR_CONFIG,
      ...options,
    }
  );

  return {
    exam: data ? { ...data, questions: undefined } : null,
    questions: data?.questions || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── Cache Invalidation Helpers ────────────────────────────────────────────────

/**
 * Mutate/refresh all exam list caches
 * Call this after creating/updating/deleting an exam
 */
export function useExamMutations() {
  const { mutate } = useSWR();

  const refreshAllExams = () => {
    // Invalidate all exam list caches
    mutate(
      (key) => Array.isArray(key) && key[0] === 'exams',
      undefined,
      { revalidate: true }
    );
  };

  const refreshExam = (examId) => {
    mutate(`exam:${examId}`, undefined, { revalidate: true });
    mutate(`exam:questions:${examId}`, undefined, { revalidate: true });
  };

  return {
    refreshAllExams,
    refreshExam,
  };
}

export { SWR_CONFIG };

export default {
  useExams,
  useExam,
  useExamWithQuestions,
  useExamMutations,
};
