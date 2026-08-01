import { useState, useEffect, useCallback } from 'react';
import dbManager from '../utils/indexedDB';

/**
 * useOfflineStorage Hook
 * Provides easy access to IndexedDB operations
 * Automatically syncs with IndexedDB and provides loading states
 */

export function useOfflineStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cachedExams, setCachedExams] = useState([]);
  const [syncQueueSize, setSyncQueueSize] = useState(0);

  // Initialize IndexedDB
  useEffect(() => {
    dbManager.init()
      .then(() => {
        setIsInitialized(true);
        refreshCachedExams();
        refreshSyncQueue();
      })
      .catch(error => {
        console.error('Failed to initialize IndexedDB:', error);
      });
  }, []);

  // Refresh cached exams list
  const refreshCachedExams = useCallback(async () => {
    try {
      const exams = await dbManager.getCachedExamsList();
      setCachedExams(exams);
    } catch (error) {
      console.error('Error refreshing cached exams:', error);
    }
  }, []);

  // Refresh sync queue size
  const refreshSyncQueue = useCallback(async () => {
    try {
      const size = await dbManager.getSyncQueueSize();
      setSyncQueueSize(size);
    } catch (error) {
      console.error('Error refreshing sync queue:', error);
    }
  }, []);

  // Cache an exam
  const cacheExam = useCallback(async (exam, questions) => {
    try {
      const success = await dbManager.cacheExam(exam, questions);
      if (success) {
        await refreshCachedExams();
      }
      return success;
    } catch (error) {
      console.error('Error caching exam:', error);
      return false;
    }
  }, [refreshCachedExams]);

  // Get cached exam
  const getCachedExam = useCallback(async (examId) => {
    try {
      return await dbManager.getCachedExam(examId);
    } catch (error) {
      console.error('Error getting cached exam:', error);
      return null;
    }
  }, []);

  // Check if exam is cached
  const isExamCached = useCallback(async (examId) => {
    try {
      return await dbManager.isExamCached(examId);
    } catch (error) {
      console.error('Error checking exam cache:', error);
      return false;
    }
  }, []);

  // Delete exam cache
  const deleteExamCache = useCallback(async (examId) => {
    try {
      await dbManager.deleteExamCache(examId);
      await refreshCachedExams();
      return true;
    } catch (error) {
      console.error('Error deleting exam cache:', error);
      return false;
    }
  }, [refreshCachedExams]);

  // Save answer offline
  const saveAnswer = useCallback(async (attemptId, questionId, answer) => {
    try {
      await dbManager.saveAnswer(attemptId, questionId, answer);
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }, []);

  // Get attempt answers
  const getAttemptAnswers = useCallback(async (attemptId) => {
    try {
      return await dbManager.getAttemptAnswers(attemptId);
    } catch (error) {
      console.error('Error getting attempt answers:', error);
      return [];
    }
  }, []);

  // Add to sync queue
  const addToSyncQueue = useCallback(async (type, data) => {
    try {
      await dbManager.addToSyncQueue(type, data);
      await refreshSyncQueue();
      return true;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return false;
    }
  }, [refreshSyncQueue]);

  // Get sync queue
  const getSyncQueue = useCallback(async () => {
    try {
      return await dbManager.getSyncQueue();
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }, []);

  // Remove from sync queue
  const removeFromSyncQueue = useCallback(async (id) => {
    try {
      await dbManager.removeFromSyncQueue(id);
      await refreshSyncQueue();
      return true;
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      return false;
    }
  }, [refreshSyncQueue]);

  // Clear sync queue
  const clearSyncQueue = useCallback(async () => {
    try {
      await dbManager.clearSyncQueue();
      await refreshSyncQueue();
      return true;
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      return false;
    }
  }, [refreshSyncQueue]);

  return {
    // State
    isInitialized,
    cachedExams,
    syncQueueSize,

    // Exam cache operations
    cacheExam,
    getCachedExam,
    isExamCached,
    deleteExamCache,
    refreshCachedExams,

    // Answer operations
    saveAnswer,
    getAttemptAnswers,

    // Sync queue operations
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue,
    clearSyncQueue,
    refreshSyncQueue,
  };
}

export default useOfflineStorage;
