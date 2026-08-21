import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentAttempts from '../components/dashboard/RecentAttempts';

describe('RecentAttempts responsive presentation', () => {
  it('exposes each attempt as a mobile-friendly summary', () => {
    render(
      <RecentAttempts
        attempts={[{
          attemptId: 'attempt-1',
          examTitle: 'Physics Mock Test',
          score: 42,
          totalMarks: 50,
          status: 'COMPLETED',
          startedAt: '2026-08-20T10:00:00.000Z',
        }]}
      />
    );

    expect(screen.getAllByText('Physics Mock Test')).toHaveLength(2);
    expect(screen.getAllByText('42 / 50')).toHaveLength(2);
    expect(screen.getAllByText('Completed')).toHaveLength(2);
  });
});
