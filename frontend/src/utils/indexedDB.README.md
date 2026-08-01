# IndexedDB Manager Documentation

## Overview

The IndexedDB Manager provides a complete offline storage solution for the TU Mock Test Platform with support for:

- **Exam caching** with automatic LRU eviction (5 most recent exams)
- **Answer persistence** for offline exam attempts
- **Sync queue** for deferred submissions when offline
- **Cache metadata** tracking for intelligent cache management

## Architecture

### Database Schema

**Database Name:** `TU_Mock_Test_DB`  
**Version:** 1

#### Stores

1. **exams** - Cached exam data
   - Key: `id` (exam ID)
   - Indexes: `categoryId`, `cachedAt`

2. **questions** - Cached exam questions
   - Key: `id` (question ID)
   - Indexes: `examId`

3. **answers** - User answers for offline attempts
   - Composite Key: `[attemptId, questionId]`
   - Indexes: `attemptId`, `synced`

4. **syncQueue** - Pending operations to sync when online
   - Key: `id` (auto-increment)
   - Indexes: `type`, `timestamp`

5. **cacheMeta** - LRU tracking metadata
   - Key: `examId`
   - Indexes: `lastAccessed`

## Usage

### Initialization

The IndexedDB manager is a singleton that initializes automatically on first use:

```javascript
import dbManager from './utils/indexedDB';

// No explicit initialization needed - happens automatically
const cached = await dbManager.getCachedExam('exam-123');
```

### Exam Caching

#### Cache an Exam

```javascript
const exam = {
  id: 'exam-123',
  title: 'IOE Mock Test 1',
  description: 'Practice exam',
  durationMinutes: 120,
  totalMarks: 100,
  categoryId: 'ioe',
};

const questions = [
  {
    id: 'q1',
    questionText: 'What is 2 + 2?',
    options: { A: '3', B: '4', C: '5', D: '6' },
    correctAnswer: 'B',
    marks: 1,
  },
  // ... more questions
];

await dbManager.cacheExam(exam, questions);
```

#### Retrieve Cached Exam

```javascript
const cached = await dbManager.getCachedExam('exam-123');
if (cached) {
  console.log('Exam:', cached.exam);
  console.log('Questions:', cached.questions);
}
```

#### Check if Exam is Cached

```javascript
const isCached = await dbManager.isExamCached('exam-123');
if (isCached) {
  console.log('Exam available offline');
}
```

#### Get List of Cached Exams

```javascript
const cachedExams = await dbManager.getCachedExamsList();
// Returns array sorted by most recently accessed
cachedExams.forEach(exam => {
  console.log(exam.examId, exam.title, new Date(exam.lastAccessed));
});
```

#### Manual Cache Deletion

```javascript
await dbManager.deleteExamCache('exam-123');
```

### LRU Cache Management

The cache automatically maintains **5 most recent exams**. When a 6th exam is cached, the least recently accessed exam is automatically evicted.

```javascript
// Cache 6 exams
for (let i = 1; i <= 6; i++) {
  await dbManager.cacheExam({ id: `exam-${i}`, ... }, questions);
}

// Only 5 will be retained (oldest evicted)
const list = await dbManager.getCachedExamsList();
console.log(list.length); // 5
```

### Answer Persistence

#### Save Answer Offline

```javascript
await dbManager.saveAnswer(
  'attempt-123',  // attemptId
  'q1',           // questionId
  {
    selectedOption: 'B',
    timeTakenSec: 45,
  }
);
```

#### Retrieve Attempt Answers

```javascript
const answers = await dbManager.getAttemptAnswers('attempt-123');
answers.forEach(answer => {
  console.log(
    `Q${answer.questionId}: ${answer.selectedOption} (${answer.timeTakenSec}s)`
  );
});
```

#### Get Unsynced Answers

```javascript
const unsynced = await dbManager.getUnsyncedAnswers();
console.log(`${unsynced.length} answers pending sync`);
```

#### Mark Answers as Synced

```javascript
await dbManager.markAnswersSynced('attempt-123');
```

### Sync Queue Management

#### Add to Sync Queue

```javascript
await dbManager.addToSyncQueue('attempt', {
  attemptId: 'attempt-123',
  examId: 'exam-123',
  answers: [
    { questionId: 'q1', selectedOption: 'B', timeTakenSec: 45 },
    { questionId: 'q2', selectedOption: 'C', timeTakenSec: 60 },
  ],
  startedAt: Date.now(),
  completedAt: Date.now(),
});
```

#### Get Sync Queue

```javascript
const queue = await dbManager.getSyncQueue();
// Returns array sorted by timestamp (oldest first)
queue.forEach(item => {
  console.log(item.type, item.timestamp, item.retries);
});
```

#### Get Queue Size

```javascript
const size = await dbManager.getSyncQueueSize();
console.log(`${size} items pending sync`);
```

#### Remove from Queue

```javascript
await dbManager.removeFromSyncQueue(queueItemId);
```

#### Clear Queue

```javascript
await dbManager.clearSyncQueue();
```

## High-Level Exam Cache Utility

For simplified exam caching with automatic API fallback, use the `examCache` utility:

```javascript
import examCache from './utils/examCache';
import api from './api';

// Fetch with automatic caching
const exam = await examCache.fetchExam('exam-123', async (id) => {
  // Your API fetch function
  return await api.get(`/exams/${id}`);
});

if (exam.fromCache) {
  console.log('Loaded from cache');
}

// Prefetch exam for offline use
await examCache.prefetchExam('exam-456', api.getExam);

// Get cache statistics
const stats = await examCache.getCacheStats();
console.log(`${stats.cachedExamsCount} exams cached`);
console.log(`${stats.syncQueueSize} items pending sync`);

// Clear all cache
await examCache.clearAllCache();
```

## Generic Store Operations

For advanced use cases, use the generic CRUD methods:

```javascript
// Get all items
const allExams = await dbManager.getAll('exams');

// Get single item
const exam = await dbManager.get('exams', 'exam-123');

// Add/update item
await dbManager.put('exams', { id: 'exam-123', ... });

// Delete item
await dbManager.delete('exams', 'exam-123');

// Get by index
const ioeExams = await dbManager.getByIndex('exams', 'categoryId', 'ioe');

// Clear store
await dbManager.clear('exams');
```

## Testing

### Browser Console Testing

```javascript
// Import and run tests
import('./utils/indexedDB.test.js').then(m => m.runTests());
```

### Manual Testing

Visit `/demo/indexeddb` in the app for an interactive demo with:
- Cache exam test
- LRU eviction test
- Answer persistence test
- Sync queue test
- Real-time cache statistics
- Test result tracking

## Integration Example

```javascript
import { useState, useEffect } from 'react';
import dbManager from './utils/indexedDB';
import examCache from './utils/examCache';
import api from './api';

function ExamPage({ examId }) {
  const [exam, setExam] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    try {
      // Try cache first, fallback to API
      const data = await examCache.fetchExam(examId, api.getExam);
      setExam(data);
      setFromCache(data.fromCache);
    } catch (error) {
      console.error('Failed to load exam:', error);
    }
  };

  const saveAnswer = async (questionId, answer) => {
    // Save locally first
    await dbManager.saveAnswer(attemptId, questionId, answer);
    
    // Try to sync
    if (navigator.onLine) {
      try {
        await api.submitAnswer(attemptId, questionId, answer);
        await dbManager.markAnswersSynced(attemptId);
      } catch (error) {
        // Add to sync queue
        await dbManager.addToSyncQueue('answer', {
          attemptId,
          questionId,
          answer,
        });
      }
    } else {
      // Add to sync queue
      await dbManager.addToSyncQueue('answer', {
        attemptId,
        questionId,
        answer,
      });
    }
  };

  return (
    <div>
      {fromCache && <span>Offline Mode - Cached Data</span>}
      {/* Render exam */}
    </div>
  );
}
```

## Performance Considerations

- **Initialization**: First call initializes DB (~10-50ms)
- **Cache lookups**: Very fast (~1-5ms)
- **Cache writes**: Fast (~5-20ms)
- **LRU eviction**: Minimal overhead (~10-30ms when triggered)

## Browser Compatibility

Supported in all modern browsers:
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## Storage Limits

- Desktop: Typically 50% of free disk space
- Mobile: Usually 50MB - 2GB depending on device
- Quota exceeded errors are handled gracefully

## Error Handling

All methods handle errors internally and log to console. For production:

```javascript
try {
  await dbManager.cacheExam(exam, questions);
} catch (error) {
  console.error('Cache failed:', error);
  // Continue with API-only operation
}
```

## Best Practices

1. **Always cache after fetch**: Cache exams when user accesses them
2. **Sync on reconnect**: Listen for online events and process sync queue
3. **Graceful degradation**: Always have API fallback
4. **Clear old data**: Periodic cleanup of very old cached data
5. **User transparency**: Show cache status to users

## Future Enhancements

- [ ] Compression for large exams
- [ ] Differential sync for partial updates
- [ ] Cache expiration TTL
- [ ] Analytics on cache hit rates
- [ ] User-controlled cache size limit
