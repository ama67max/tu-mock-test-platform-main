import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

vi.mock('../hooks/useAnalytics', () => ({
  useMyAnalytics: () => ({
    analytics: { averageScore: 80, totalAttempts: 1234, accuracy: 72, totalTimeSpentMinutes: 340 },
    isLoading: false,
  }),
  useMyTrends: () => ({ trends: [], isLoading: false }),
  useMyResults: () => ({
    results: [{ attemptId: 1, examTitle: 'Sample Exam', score: 80, totalMarks: 100, status: 'COMPLETED' }],
    isLoading: false,
  }),
}));

vi.mock('../utils/fetchers', () => ({
  myAnalyticsFetcher: vi.fn(async () => ({
    averageScore: 80,
    totalAttempts: 1234,
    accuracy: 72,
    totalTimeSpentMinutes: 340,
    subjectBreakdown: [{ name: 'Math', averageScore: 78, totalQuestions: 10 }],
  })),
  myTrendsFetcher: vi.fn(async () => [
    { date: '2026-07-01', avgScore: 80, attempts: 120 },
  ]),
  myResultsFetcher: vi.fn(async () => ({
    attempts: [{ attemptId: 1, examTitle: 'Sample Exam', score: 80, totalMarks: 100, status: 'COMPLETED' }],
    total: 1,
    page: 1,
    pages: 1,
  })),
}));

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
  default: {
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
  },
}));

vi.mock('../api/resultApi', () => ({
  getResults: vi.fn(async () => ({ data: [{ attemptId: 1, examTitle: 'Sample Exam', score: 80, totalMarks: 100, status: 'COMPLETED' }] })),
  default: {
    getResults: vi.fn(async () => ({ data: { attempts: [{ attemptId: 1, examTitle: 'Sample Exam', score: 80, totalMarks: 100, status: 'COMPLETED' }] } })),
  },
}));

describe('DashboardPage integration', () => {
  it('renders KPIs and recent attempts', async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // wait for KPI to render
    await waitFor(() => expect(screen.getByText('Average score')).toBeInTheDocument());
    expect(screen.getByText('Across completed attempts')).toBeInTheDocument();
  });
});
