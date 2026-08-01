/**
 * useIndexedDB Hook
 * Provides React integration for IndexedDB operations
 * with state management and loading indicators
 */

import { useState, useEffect, useCallback } from 'react';
import dbManager from '../utils/indexedDB';
import examCache from '../utils/examCache';

/**
 * Hook for exam caching operations
 */
export const useExamCache = () => {
  const [cacheStats, setCacheStats] = useState({
    cachedExamsCount: 0,
    cachedExams: [],
    syncQueueSize: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const stats = await examCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const cacheExam = useCallback(async (exam, questions) => {
    setLoading(true);
    try {
      await dbManager.cacheExam(exam, questions);
      await loadStats();
      return true;
    } catch (error) {
      console.error('Failed to cache exam:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  const getCachedExam = useCallback(async (examId) => {
    setLoading(true);
    try {
      const cached = await dbManager.getCachedExam(examId);
      return cached;
    } catch (error) {
      console.error('Failed to get cached exam:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const isExamCached = useCallback(async (examId) => {
    try {
      return await dbManager.isExamCached(examId);
    } catch (error) {
      console.error('Failed to check cache:', error);
      return false;
    }
  }, []);

  const clearCache = useCallback(async () => {
    setLoading(true);
    try {
      await examCache.clearAllCache();
      await loadStats();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  return {
    cacheStats,
    loading,
    cacheExam,
    getCachedExam,
    isExamCached,
    clearCache,
    refreshStats: loadStats,
  };
};

/**
 * Hook for answer persistence
 */
export const useAnswerPersistence = (attemptId) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  const loadAnswers = useCallback(async () => {
    if (!attemptId) return;
    
    setLoading(true);
    try {
      const data = await dbManager.getAttemptAnswers(attemptId);
      setAnswers(data);
      
      const unsynced = data.filter(a => !a.synced);
      setUnsyncedCount(unsynced.length);
    } catch (error) {
      console.error('Failed to load answers:', error);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  const saveAnswer = useCallback(async (questionId, answer) => {
    if (!attemptId) return false;

    try {
      await dbManager.saveAnswer(attemptId, questionId, answer);
      await loadAnswers();
      return true;
    } catch (error) {
      console.error('Failed to save answer:', error);
      return false;
    }
  }, [attemptId, loadAnswers]);

  const markSynced = useCallback(async () => {
    if (!attemptId) return false;

    try {
      await dbManager.markAnswersSynced(attemptId);
      await loadAnswers();
      return true;
    } catch (error) {
      console.error('Failed to mark answers as synced:', error);
      return false;
    }
  }, [attemptId, loadAnswers]);

  const getAnswer = useCallback((questionId) => {
    return answers.find(a => a.questionId === questionId);
  }, [answers]);

  return {
    answers,
    loading,
    unsyncedCount,
    saveAnswer,
    markSynced,
    getAnswer,
    refreshAnswers: loadAnswers,
  };
};

/**
 * Hook for sync queue management
 */
export const useSyncQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbManager.getSyncQueue();
      setQueue(data);
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const addToQueue = useCallback(async (type, data) => {
    try {
      await dbManager.addToSyncQueue(type, data);
      await loadQueue();
      return true;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      return false;
    }
  }, [loadQueue]);

  const removeFromQueue = useCallback(async (id) => {
    try {
      await dbManager.removeFromSyncQueue(id);
      await loadQueue();
      return true;
    } catch (error) {
      console.error('Failed to remove from queue:', error);
      return false;
    }
  }, [loadQueue]);

  const clearQueue = useCallback(async () => {
    try {
      await dbManager.clearSyncQueue();
      await loadQueue();
      return true;
    } catch (error) {
      console.error('Failed to clear queue:', error);
      return false;
    }
  }, [loadQueue]);

  const processQueue = useCallback(async (processFn) => {
    if (syncing || queue.length === 0) return;

    setSyncing(true);
    const results = { success: 0, failed: 0 };

    for (const item of queue) {
      try {
        await processFn(item);
        await removeFromQueue(item.id);
        results.success++;
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        results.failed++;
      }
    }

    setSyncing(false);
    return results;
  }, [queue, syncing, removeFromQueue]);

  return {
    queue,
    queueSize: queue.length,
    loading,
    syncing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    refreshQueue: loadQueue,
  };
};

/**
 * Hook for combined cache operations
 */
export const useOfflineExam = (examId, apiFetchFunction) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState(null);

  const loadExam = useCallback(async () => {
    if (!examId || !apiFetchFunction) return;

    setLoading(true);
    setError(null);

    try {
      const data = await examCache.fetchExam(examId, apiFetchFunction);
      setExam(data);
      setFromCache(data.fromCache || false);
    } catch (err) {
      setError(err);
      console.error('Failed to load exam:', err);
    } finally {
      setLoading(false);
    }
  }, [examId, apiFetchFunction]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const prefetch = useCallback(async () => {
    if (!examId || !apiFetchFunction) return false;

    try {
      await examCache.prefetchExam(examId, apiFetchFunction);
      return true;
    } catch (err) {
      console.error('Failed to prefetch exam:', err);
      return false;
    }
  }, [examId, apiFetchFunction]);

  return {
    exam,
    loading,
    fromCache,
    error,
    reload: loadExam,
    prefetch,
  };
};

/**
 * Hook for monitoring IndexedDB status
 */
export const useIndexedDBStatus = () => {
  const [supported, setSupported] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
          setSupported(false);
          setError(new Error('IndexedDB not supported'));
          return;
        }

        setSupported(true);

        // Try to initialize
        await dbManager.init();
        setInitialized(true);
      } catch (err) {
        setError(err);
        console.error('IndexedDB initialization failed:', err);
      }
    };

    checkStatus();
  }, []);

  return {
    supported,
    initialized,
    error,
    ready: supported && initialized && !error,
  };
};

export default {
  useExamCache,
  useAnswerPersistence,
  useSyncQueue,
  useOfflineExam,
  useIndexedDBStatus,
};
