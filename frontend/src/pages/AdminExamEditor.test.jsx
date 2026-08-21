import { describe, expect, it } from 'vitest';
import { normalizeExamForEditor } from './AdminExamEditor';

describe('Admin exam editor', () => {
  it('normalizes exam metadata and assigned question IDs', () => {
    expect(normalizeExamForEditor({
      title: 'Mock test',
      category: { id: 'cat-1' },
      durationMinutes: 90,
      questions: [{ id: 'q-1' }, { id: 'q-2' }],
    })).toMatchObject({
      title: 'Mock test',
      categoryId: 'cat-1',
      durationMinutes: 90,
      questionIds: ['q-1', 'q-2'],
    });
  });
});