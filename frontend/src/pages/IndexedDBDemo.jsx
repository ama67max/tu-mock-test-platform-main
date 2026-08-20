/**
 * IndexedDB Demo Page
 * Demonstrates Task 6: IndexedDB Manager for Offline Exam Storage
 * 
 * Features:
 * - Exam caching with LRU eviction (5 max)
 * - Answer persistence
 * - Sync queue management
 * - Cache statistics and monitoring
 */

import { useState, useEffect } from 'react';
import { Database, HardDrive, Upload, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import dbManager from '../utils/indexedDB';
import examCache from '../utils/examCache';

const IndexedDBDemo = () => {
  const [cacheStats, setCacheStats] = useState({
    cachedExamsCount: 0,
    cachedExams: [],
    syncQueueSize: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState([]);

  // Load cache stats
  const loadStats = async () => {
    try {
      const stats = await examCache.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Mock exam data generator
  const generateMockExam = (id) => ({
    id: `exam-${id}`,
    title: `Mock Exam ${id}`,
    description: `Practice test ${id} for demonstration`,
    durationMinutes: 120,
    totalMarks: 100,
    categoryId: 'demo',
    questions: [
      {
        id: `q${id}-1`,
        questionText: `Sample question 1 for exam ${id}`,
        options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
        correctAnswer: 'B',
        marks: 1,
      },
      {
        id: `q${id}-2`,
        questionText: `Sample question 2 for exam ${id}`,
        options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
        correctAnswer: 'C',
        marks: 1,
      },
    ],
  });

  // Test: Cache single exam
  const testCacheExam = async () => {
    setLoading(true);
    setMessage('Caching exam...');
    
    try {
      const exam = generateMockExam(Date.now());
      const success = await dbManager.cacheExam(
        {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          durationMinutes: exam.durationMinutes,
          totalMarks: exam.totalMarks,
          categoryId: exam.categoryId,
        },
        exam.questions
      );
      
      if (success) {
        setMessage(`✅ Exam cached successfully: ${exam.title}`);
        setTestResults(prev => [...prev, { test: 'Cache Exam', result: 'PASS', time: new Date().toLocaleTimeString() }]);
      }
      await loadStats();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setTestResults(prev => [...prev, { test: 'Cache Exam', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  // Test: Cache multiple exams (triggers LRU eviction)
  const testLRUEviction = async () => {
    setLoading(true);
    setMessage('Testing LRU eviction (caching 6 exams)...');
    
    try {
      // Cache 6 exams (should evict the oldest)
      for (let i = 1; i <= 6; i++) {
        const exam = generateMockExam(1000 + i);
        await dbManager.cacheExam(
          {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            durationMinutes: exam.durationMinutes,
            totalMarks: exam.totalMarks,
            categoryId: exam.categoryId,
          },
          exam.questions
        );
        await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different timestamps
      }
      
      await loadStats();
      
      if (cacheStats.cachedExamsCount <= 5) {
        setMessage(`✅ LRU eviction works! Cached exams: ${cacheStats.cachedExamsCount}/5`);
        setTestResults(prev => [...prev, { test: 'LRU Eviction', result: 'PASS', time: new Date().toLocaleTimeString() }]);
      } else {
        setMessage(`❌ LRU failed: ${cacheStats.cachedExamsCount} exams cached (expected ≤5)`);
        setTestResults(prev => [...prev, { test: 'LRU Eviction', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setTestResults(prev => [...prev, { test: 'LRU Eviction', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  // Test: Save and retrieve answers
  const testAnswerPersistence = async () => {
    setLoading(true);
    setMessage('Testing answer persistence...');
    
    try {
      const attemptId = `attempt-${Date.now()}`;
      const questionId = 'q1';
      
      // Save answer
      await dbManager.saveAnswer(attemptId, questionId, {
        selectedOption: 'B',
        timeTakenSec: 45,
      });
      
      // Retrieve answers
      const answers = await dbManager.getAttemptAnswers(attemptId);
      
      if (answers.length > 0 && answers[0].selectedOption === 'B') {
        setMessage(`✅ Answer persisted successfully! Retrieved ${answers.length} answer(s)`);
        setTestResults(prev => [...prev, { test: 'Answer Persistence', result: 'PASS', time: new Date().toLocaleTimeString() }]);
      } else {
        setMessage(`❌ Answer persistence failed`);
        setTestResults(prev => [...prev, { test: 'Answer Persistence', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setTestResults(prev => [...prev, { test: 'Answer Persistence', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  // Test: Sync queue
  const testSyncQueue = async () => {
    setLoading(true);
    setMessage('Testing sync queue...');
    
    try {
      // Add to queue
      await dbManager.addToSyncQueue('attempt', {
        attemptId: `attempt-${Date.now()}`,
        examId: 'exam-1',
        answers: [{ questionId: 'q1', selectedOption: 'B' }],
      });
      
      // Get queue
      const queue = await dbManager.getSyncQueue();
      const queueSize = await dbManager.getSyncQueueSize();
      
      if (queueSize > 0 && queue.length > 0) {
        setMessage(`✅ Sync queue working! Size: ${queueSize}`);
        setTestResults(prev => [...prev, { test: 'Sync Queue', result: 'PASS', time: new Date().toLocaleTimeString() }]);
      } else {
        setMessage(`❌ Sync queue failed`);
        setTestResults(prev => [...prev, { test: 'Sync Queue', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
      }
      
      await loadStats();
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setTestResults(prev => [...prev, { test: 'Sync Queue', result: 'FAIL', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  // Clear all cache
  const clearCache = async () => {
    if (!confirm('Clear all cached data?')) return;
    
    setLoading(true);
    setMessage('Clearing cache...');
    
    try {
      await examCache.clearAllCache();
      await dbManager.clearSyncQueue();
      await loadStats();
      setMessage('✅ Cache cleared successfully');
      setTestResults([]);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    await testCacheExam();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAnswerPersistence();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSyncQueue();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testLRUEviction();
  };

  return (
    <div className="demo-monochrome min-h-screen bg-background p-8 text-primary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-10 h-10 text-white" />
            <h1 className="text-display font-semibold text-white">
              IndexedDB Demo
            </h1>
          </div>
          <p className="text-body text-silver-400">
            Task 6: IndexedDB Manager for Offline Exam Storage - Complete implementation with LRU cache, answer persistence, and sync queue
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-6 h-6 text-silver-400" />
              <span className="text-subheading font-semibold text-white">
                {cacheStats.cachedExamsCount}/5
              </span>
            </div>
            <p className="text-body text-silver-400">Cached Exams</p>
          </div>

          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Upload className="w-6 h-6 text-silver-400" />
              <span className="text-subheading font-semibold text-white">
                {cacheStats.syncQueueSize}
              </span>
            </div>
            <p className="text-body text-silver-400">Sync Queue</p>
          </div>

          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-silver-400" />
              <span className="text-subheading font-semibold text-white">
                {testResults.filter(t => t.result === 'PASS').length}/{testResults.length}
              </span>
            </div>
            <p className="text-body text-silver-400">Tests Passed</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8 mb-8">
          <h2 className="text-heading font-semibold text-white mb-6">
            Test Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testCacheExam}
              disabled={loading}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              Test Cache Exam
            </button>

            <button
              onClick={testLRUEviction}
              disabled={loading}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              Test LRU Eviction
            </button>

            <button
              onClick={testAnswerPersistence}
              disabled={loading}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              Test Answer Persist
            </button>

            <button
              onClick={testSyncQueue}
              disabled={loading}
              className="bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-500 hover:to-silver-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              Test Sync Queue
            </button>

            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-gradient-to-r from-white to-silver-200 hover:from-silver-100 hover:to-silver-300 text-black font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
            >
              Run All Tests
            </button>

            <button
              onClick={clearCache}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-green-900/20 border-green-700 text-green-400' 
                : message.includes('❌')
                ? 'bg-red-900/20 border-red-700 text-red-400'
                : 'bg-silver-900/20 border-silver-700 text-silver-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8 mb-8">
            <h2 className="text-heading font-semibold text-white mb-6">
              Test Results
            </h2>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-darkGray-900 rounded-lg border border-silver-800"
                >
                  <div className="flex items-center gap-3">
                    {result.result === 'PASS' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-body text-white font-medium">
                      {result.test}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.result === 'PASS'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {result.result}
                    </span>
                    <div className="flex items-center gap-1 text-silver-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {result.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cached Exams List */}
        {cacheStats.cachedExams.length > 0 && (
          <div className="bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8">
            <h2 className="text-heading font-semibold text-white mb-6">
              Cached Exams (Most Recent First)
            </h2>
            
            <div className="space-y-3">
              {cacheStats.cachedExams.map((exam, index) => (
                <div
                  key={exam.examId}
                  className="flex items-center justify-between p-4 bg-darkGray-900 rounded-lg border border-silver-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-silver-600 to-silver-700 flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-body text-white font-medium">
                        {exam.title || exam.examId}
                      </p>
                      <p className="text-sm text-silver-500">
                        ID: {exam.examId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-silver-400">
                      Last accessed
                    </p>
                    <p className="text-sm text-silver-500">
                      {new Date(exam.lastAccessed).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-8 bg-gradient-to-br from-darkGray-800 to-darkGray-900 border border-silver-700 rounded-lg p-8">
          <h2 className="text-heading font-semibold text-white mb-6">
            Implemented Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">IndexedDB Schema</p>
                <p className="text-sm text-silver-500">Exams, questions, answers, sync queue, cache metadata stores</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">LRU Cache Eviction</p>
                <p className="text-sm text-silver-500">Automatically maintains 5 most recent exams</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">Answer Persistence</p>
                <p className="text-sm text-silver-500">Offline answer storage with sync tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">Sync Queue</p>
                <p className="text-sm text-silver-500">Queue for offline submissions with retry logic</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">CRUD Operations</p>
                <p className="text-sm text-silver-500">Complete get, put, delete, getByIndex methods</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-body text-white font-medium">Cache Management</p>
                <p className="text-sm text-silver-500">Statistics, clear cache, exam prefetching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexedDBDemo;
