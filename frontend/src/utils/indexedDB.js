/**
 * IndexedDB Manager for Offline Exam Storage
 * Implements LRU cache for 5 most recent exams
 * Stores exams, questions, user answers, and sync queue
 */

const DB_NAME = 'TU_Mock_Test_DB';
const DB_VERSION = 1;

// Store names
const STORES = {
  EXAMS: 'exams',
  QUESTIONS: 'questions',
  ANSWERS: 'answers',
  SYNC_QUEUE: 'syncQueue',
  CACHE_META: 'cacheMeta',
};

// Maximum number of cached exams (LRU)
const MAX_CACHED_EXAMS = 5;

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initialize IndexedDB with schema
   */
  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Exams store
        if (!db.objectStoreNames.contains(STORES.EXAMS)) {
          const examStore = db.createObjectStore(STORES.EXAMS, { keyPath: 'id' });
          examStore.createIndex('categoryId', 'categoryId', { unique: false });
          examStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Questions store
        if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
          const questionStore = db.createObjectStore(STORES.QUESTIONS, { keyPath: 'id' });
          questionStore.createIndex('examId', 'examId', { unique: false });
        }

        // Answers store (for offline attempts)
        if (!db.objectStoreNames.contains(STORES.ANSWERS)) {
          const answerStore = db.createObjectStore(STORES.ANSWERS, { 
            keyPath: ['attemptId', 'questionId'] 
          });
          answerStore.createIndex('attemptId', 'attemptId', { unique: false });
          answerStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue for offline submissions
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Cache metadata for LRU tracking
        if (!db.objectStoreNames.contains(STORES.CACHE_META)) {
          const metaStore = db.createObjectStore(STORES.CACHE_META, { keyPath: 'examId' });
          metaStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generic method to get all items from a store
   */
  async getAll(storeName) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get a single item by key
   */
  async get(storeName, key) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to add/update an item
   */
  async put(storeName, item) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to delete an item
   */
  async delete(storeName, key) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get items by index
   */
  async getByIndex(storeName, indexName, value) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== EXAM CACHE METHODS ====================

  /**
   * Cache an exam with LRU eviction
   */
  async cacheExam(exam, questions) {
    await this.init();

    try {
      // Check cache size and evict oldest if necessary
      await this.enforceCacheLimit();

      // Store exam
      const examData = {
        ...exam,
        cachedAt: Date.now(),
      };
      await this.put(STORES.EXAMS, examData);

      // Store questions
      if (questions && questions.length > 0) {
        const transaction = this.db.transaction(STORES.QUESTIONS, 'readwrite');
        const store = transaction.objectStore(STORES.QUESTIONS);
        
        questions.forEach(question => {
          store.put({
            ...question,
            examId: exam.id,
          });
        });

        await new Promise((resolve, reject) => {
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });
      }

      // Update cache metadata
      await this.put(STORES.CACHE_META, {
        examId: exam.id,
        lastAccessed: Date.now(),
        title: exam.title,
      });

      console.log(`Exam ${exam.id} cached successfully`);
      return true;
    } catch (error) {
      console.error('Error caching exam:', error);
      return false;
    }
  }

  /**
   * Enforce LRU cache limit (keep only 5 most recent)
   */
  async enforceCacheLimit() {
    const cacheMeta = await this.getAll(STORES.CACHE_META);
    
    if (cacheMeta.length >= MAX_CACHED_EXAMS) {
      // Sort by lastAccessed (oldest first)
      cacheMeta.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Remove oldest exams
      const toRemove = cacheMeta.slice(0, cacheMeta.length - MAX_CACHED_EXAMS + 1);
      
      for (const meta of toRemove) {
        await this.deleteExamCache(meta.examId);
      }
    }
  }

  /**
   * Get cached exam with questions
   */
  async getCachedExam(examId) {
    const exam = await this.get(STORES.EXAMS, examId);
    
    if (!exam) return null;

    const questions = await this.getByIndex(STORES.QUESTIONS, 'examId', examId);

    // Update last accessed time
    await this.put(STORES.CACHE_META, {
      examId,
      lastAccessed: Date.now(),
      title: exam.title,
    });

    return {
      exam,
      questions,
    };
  }

  /**
   * Check if exam is cached
   */
  async isExamCached(examId) {
    const exam = await this.get(STORES.EXAMS, examId);
    return !!exam;
  }

  /**
   * Delete exam cache
   */
  async deleteExamCache(examId) {
    // Delete exam
    await this.delete(STORES.EXAMS, examId);

    // Delete questions
    const questions = await this.getByIndex(STORES.QUESTIONS, 'examId', examId);
    const transaction = this.db.transaction(STORES.QUESTIONS, 'readwrite');
    const store = transaction.objectStore(STORES.QUESTIONS);
    
    questions.forEach(q => store.delete(q.id));

    await new Promise((resolve) => {
      transaction.oncomplete = resolve;
    });

    // Delete cache metadata
    await this.delete(STORES.CACHE_META, examId);

    console.log(`Exam ${examId} cache deleted`);
  }

  /**
   * Get all cached exams metadata
   */
  async getCachedExamsList() {
    const cacheMeta = await this.getAll(STORES.CACHE_META);
    
    // Sort by most recently accessed
    cacheMeta.sort((a, b) => b.lastAccessed - a.lastAccessed);
    
    return cacheMeta;
  }

  /**
   * Returns an array of cached exams including basic exam data and question counts.
   * This is a convenience method expected by pages that display the cached exam list.
   */
  async getCachedExams() {
    const meta = await this.getCachedExamsList();
    const results = [];

    for (const entry of meta) {
      try {
        const exam = await this.get(STORES.EXAMS, entry.examId);
        if (!exam) continue;
        const questions = await this.getByIndex(STORES.QUESTIONS, 'examId', entry.examId);
        results.push({
          id: exam.id,
          _id: exam.id,
          title: exam.title,
          description: exam.description,
          category: exam.category || null,
          cachedAt: exam.cachedAt || entry.lastAccessed,
          questionsCount: Array.isArray(questions) ? questions.length : 0,
        });
      } catch (e) {
        console.warn('Failed to build cached exam entry for', entry.examId, e);
      }
    }

    return results;
  }

  // ==================== ANSWER PERSISTENCE METHODS ====================

  /**
   * Save answer for offline attempt
   */
  async saveAnswer(attemptId, questionId, answer) {
    const answerData = {
      attemptId,
      questionId,
      selectedOption: answer.selectedOption,
      timeTakenSec: answer.timeTakenSec || 0,
      timestamp: Date.now(),
      synced: false,
    };

    await this.put(STORES.ANSWERS, answerData);
    console.log(`Answer saved offline: attempt=${attemptId}, question=${questionId}`);
  }

  /**
   * Get all answers for an attempt
   */
  async getAttemptAnswers(attemptId) {
    return await this.getByIndex(STORES.ANSWERS, 'attemptId', attemptId);
  }

  /**
   * Mark answers as synced
   */
  async markAnswersSynced(attemptId) {
    const answers = await this.getAttemptAnswers(attemptId);
    
    const transaction = this.db.transaction(STORES.ANSWERS, 'readwrite');
    const store = transaction.objectStore(STORES.ANSWERS);
    
    answers.forEach(answer => {
      store.put({ ...answer, synced: true });
    });

    await new Promise((resolve) => {
      transaction.oncomplete = resolve;
    });
  }

  /**
   * Get unsynced answers
   */
  async getUnsyncedAnswers() {
    return await this.getByIndex(STORES.ANSWERS, 'synced', false);
  }

  // ==================== SYNC QUEUE METHODS ====================

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(type, data) {
    const queueItem = {
      type, // 'attempt', 'answer', etc.
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    await this.put(STORES.SYNC_QUEUE, queueItem);
    console.log(`Added to sync queue: ${type}`);
  }

  /**
   * Get all sync queue items
   */
  async getSyncQueue() {
    const items = await this.getAll(STORES.SYNC_QUEUE);
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id) {
    await this.delete(STORES.SYNC_QUEUE, id);
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue() {
    await this.clear(STORES.SYNC_QUEUE);
  }

  /**
   * Get sync queue size
   */
  async getSyncQueueSize() {
    const items = await this.getAll(STORES.SYNC_QUEUE);
    return items.length;
  }
}

// Export singleton instance
const dbManager = new IndexedDBManager();
export default dbManager;
