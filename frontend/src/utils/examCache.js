import dbManager from './indexedDB';
import { addExamToLocalStorageCache, sendMessageToServiceWorker, SW_MESSAGE_TYPE } from './swHelpers';

/**
 * Exam Caching Utility
 * Automatically caches exams when accessed
 * Implements transparent caching layer
 */

class ExamCache {
  constructor() {
    this.cachePromises = new Map(); // Prevent duplicate cache operations
  }

  /**
   * Fetch exam with automatic caching
   * First checks IndexedDB, then fetches from API if needed
   */
  async fetchExam(examId, apiFetchFunction) {
    try {
      // Track most recently accessed exams in localStorage
      addExamToLocalStorageCache(examId);

      // Check if exam is cached
      const cached = await dbManager.getCachedExam(examId);
      
      if (cached) {
        console.log(`Loading exam ${examId} from cache`);
        return {
          ...cached.exam,
          questions: cached.questions,
          fromCache: true,
        };
      }

      // Not cached, fetch from API
      console.log(`Fetching exam ${examId} from API`);
      const examData = await apiFetchFunction(examId);

      // Cache in background (don't block return)
      this.cacheExamInBackground(examId, examData);
      sendMessageToServiceWorker({ type: SW_MESSAGE_TYPE.PREFETCH_EXAM, examId });

      return {
        ...examData,
        fromCache: false,
      };
    } catch (error) {
      console.error('Error fetching exam:', error);
      
      // Try to return cached version as fallback
      const cached = await dbManager.getCachedExam(examId);
      if (cached) {
        console.log('Returning stale cached exam as fallback');
        return {
          ...cached.exam,
          questions: cached.questions,
          fromCache: true,
          stale: true,
        };
      }
      
      throw error;
    }
  }

  /**
   * Cache exam in background without blocking
   */
  async cacheExamInBackground(examId, examData) {
    // Prevent duplicate caching operations
    if (this.cachePromises.has(examId)) {
      return this.cachePromises.get(examId);
    }

    const cachePromise = (async () => {
      try {
        await dbManager.cacheExam(
          {
            id: examId,
            title: examData.title,
            description: examData.description,
            durationMinutes: examData.durationMinutes,
            totalMarks: examData.totalMarks,
            categoryId: examData.categoryId,
          },
          examData.questions || []
        );
        console.log(`Exam ${examId} cached successfully in background`);
      } catch (error) {
        console.error(`Failed to cache exam ${examId}:`, error);
      } finally {
        this.cachePromises.delete(examId);
      }
    })();

    this.cachePromises.set(examId, cachePromise);
    return cachePromise;
  }

  /**
   * Prefetch and cache exam (for proactive caching)
   */
  async prefetchExam(examId, apiFetchFunction) {
    try {
      addExamToLocalStorageCache(examId);

      // Check if already cached
      const isCached = await dbManager.isExamCached(examId);
      if (isCached) {
        console.log(`Exam ${examId} already cached, skipping prefetch`);
        return true;
      }

      // Fetch and cache
      const examData = await apiFetchFunction(examId);
      await this.cacheExamInBackground(examId, examData);
      sendMessageToServiceWorker({ type: SW_MESSAGE_TYPE.PREFETCH_EXAM, examId });
      
      return true;
    } catch (error) {
      console.error(`Failed to prefetch exam ${examId}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const cached = await dbManager.getCachedExamsList();
    const syncQueueSize = await dbManager.getSyncQueueSize();
    
    return {
      cachedExamsCount: cached.length,
      cachedExams: cached,
      syncQueueSize,
    };
  }

  /**
   * Clear all cached data (for debugging or storage management)
   */
  async clearAllCache() {
    const cached = await dbManager.getCachedExamsList();
    
    for (const exam of cached) {
      await dbManager.deleteExamCache(exam.examId);
    }
    
    console.log('All exam cache cleared');
  }
}

// Export singleton instance
const examCache = new ExamCache();
export default examCache;
