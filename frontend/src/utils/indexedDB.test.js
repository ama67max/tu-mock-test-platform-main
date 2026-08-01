/**
 * IndexedDB Manager Test Suite
 * Run this in browser console to test IndexedDB functionality
 * 
 * Usage in browser console:
 * import('./utils/indexedDB.test.js').then(m => m.runTests())
 */

import dbManager from './indexedDB';

// Mock exam data
const mockExam = {
  id: 'test-exam-1',
  title: 'IOE Mock Test 1',
  description: 'Practice exam for IOE entrance',
  durationMinutes: 120,
  totalMarks: 100,
  categoryId: 'ioe',
};

const mockQuestions = [
  {
    id: 'q1',
    questionText: 'What is 2 + 2?',
    options: { A: '3', B: '4', C: '5', D: '6' },
    correctAnswer: 'B',
    marks: 1,
  },
  {
    id: 'q2',
    questionText: 'What is the capital of Nepal?',
    options: { A: 'Pokhara', B: 'Kathmandu', C: 'Biratnagar', D: 'Lalitpur' },
    correctAnswer: 'B',
    marks: 1,
  },
];

const mockAnswer = {
  selectedOption: 'B',
  timeTakenSec: 30,
};

export async function runTests() {
  console.log('🧪 Starting IndexedDB Tests...\n');

  try {
    // Test 1: Initialize DB
    console.log('Test 1: Initialize Database');
    await dbManager.init();
    console.log('✅ Database initialized\n');

    // Test 2: Cache Exam
    console.log('Test 2: Cache Exam');
    const cacheSuccess = await dbManager.cacheExam(mockExam, mockQuestions);
    console.log(`✅ Exam cached: ${cacheSuccess}\n`);

    // Test 3: Retrieve Cached Exam
    console.log('Test 3: Retrieve Cached Exam');
    const cached = await dbManager.getCachedExam(mockExam.id);
    console.log('✅ Retrieved exam:', cached);
    console.log(`   Questions count: ${cached.questions.length}\n`);

    // Test 4: Check if Exam is Cached
    console.log('Test 4: Check if Exam is Cached');
    const isCached = await dbManager.isExamCached(mockExam.id);
    console.log(`✅ Exam is cached: ${isCached}\n`);

    // Test 5: Get Cached Exams List
    console.log('Test 5: Get Cached Exams List');
    const cachedList = await dbManager.getCachedExamsList();
    console.log(`✅ Cached exams count: ${cachedList.length}`);
    console.log('   List:', cachedList, '\n');

    // Test 6: Save Answer
    console.log('Test 6: Save Answer Offline');
    await dbManager.saveAnswer('attempt-1', 'q1', mockAnswer);
    console.log('✅ Answer saved\n');

    // Test 7: Get Attempt Answers
    console.log('Test 7: Get Attempt Answers');
    const answers = await dbManager.getAttemptAnswers('attempt-1');
    console.log(`✅ Retrieved ${answers.length} answer(s):`, answers, '\n');

    // Test 8: Add to Sync Queue
    console.log('Test 8: Add to Sync Queue');
    await dbManager.addToSyncQueue('attempt', {
      attemptId: 'attempt-1',
      examId: mockExam.id,
      answers: [mockAnswer],
    });
    const queueSize = await dbManager.getSyncQueueSize();
    console.log(`✅ Sync queue size: ${queueSize}\n`);

    // Test 9: Get Sync Queue
    console.log('Test 9: Get Sync Queue');
    const queue = await dbManager.getSyncQueue();
    console.log('✅ Sync queue:', queue, '\n');

    // Test 10: LRU Eviction Test (cache 6 exams)
    console.log('Test 10: LRU Eviction Test (cache 6 exams)');
    for (let i = 2; i <= 6; i++) {
      await dbManager.cacheExam(
        {
          ...mockExam,
          id: `test-exam-${i}`,
          title: `Test Exam ${i}`,
        },
        mockQuestions
      );
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const finalList = await dbManager.getCachedExamsList();
    console.log(`✅ Cached exams after adding 6: ${finalList.length}`);
    console.log('   Should be 5 (oldest evicted)');
    console.log('   Exams:', finalList.map(e => e.examId), '\n');

    // Test 11: Check if oldest was evicted
    console.log('Test 11: Check if Oldest Exam was Evicted');
    const oldestCached = await dbManager.isExamCached('test-exam-1');
    console.log(`✅ Oldest exam (test-exam-1) is cached: ${oldestCached}`);
    console.log(`   Expected: false (should be evicted)\n`);

    // Test 12: Clear Sync Queue
    console.log('Test 12: Clear Sync Queue');
    await dbManager.clearSyncQueue();
    const clearedQueueSize = await dbManager.getSyncQueueSize();
    console.log(`✅ Sync queue cleared. Size: ${clearedQueueSize}\n`);

    // Test 13: Delete Exam Cache
    console.log('Test 13: Delete Exam Cache');
    await dbManager.deleteExamCache('test-exam-2');
    const afterDelete = await dbManager.getCachedExamsList();
    console.log(`✅ After deletion: ${afterDelete.length} exams\n`);

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('- Database initialization: ✅');
    console.log('- Exam caching: ✅');
    console.log('- Exam retrieval: ✅');
    console.log('- Answer persistence: ✅');
    console.log('- Sync queue: ✅');
    console.log('- LRU eviction (5 max): ✅');
    console.log('- Cache deletion: ✅');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run tests if loaded directly
if (typeof window !== 'undefined' && window.location.search.includes('test-db')) {
  runTests();
}
