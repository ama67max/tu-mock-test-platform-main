import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

vi.mock('../api/analyticsApi', () => ({
  getMyAnalytics: vi.fn(async () => ({
    data: {
      averageScore: 80,
      totalAttempts: 1234,
      accuracy: 72,
      totalTimeSpentMinutes: 340,
      subjectBreakdown: [{ name: 'Math', averageScore: 78, totalQuestions: 10 }],
    },
  })),
  getMyAttemptTrends: vi.fn(async () => ({
    data: [{ date: '2026-07-01', average_score: 80, attempts: 120 }],
  })),
}));

vi.mock('../api/resultApi', () => ({
  getResults: vi.fn(async () => ({ data: [{ attemptId: 1, examTitle: 'Sample Exam', score: 80, totalMarks: 100, status: 'COMPLETED' }] })),
}));

describe('DashboardPage integration', () => {
  it('renders KPIs and recent attempts', async () => {
    render(<DashboardPage />);

    // wait for KPI to render
    await waitFor(() => expect(screen.getByText('Avg Score')).toBeInTheDocument());
    expect(screen.getByText('80')).toBeInTheDocument();

    // recent attempts
    await waitFor(() => expect(screen.getByText('Sample Exam')).toBeInTheDocument());
  });
});
