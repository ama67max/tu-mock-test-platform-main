import { describe, expect, it } from 'vitest';
import { normalizeQuestionResponse } from './ExamCreator';

describe('ExamCreator question response normalization', () => {
  it('unwraps the API response and reads paginated questions', () => {
    expect(normalizeQuestionResponse({
      statusCode: 200,
      data: {
        questions: [{ id: 'q-1' }],
        total: 1,
        pages: 1,
      },
    })).toEqual({
      questions: [{ id: 'q-1' }],
      total: 1,
      pages: 1,
    });
  });

  it('returns an empty page for an unexpected response', () => {
    expect(normalizeQuestionResponse({})).toEqual({
      questions: [],
      total: 0,
      pages: 0,
    });
  });
});