import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useExams, SWR_CONFIG } from '../hooks/useExams';

const fetcher = vi.fn(async () => [{ id: 'exam-1', title: 'Cached Exam' }]);

vi.mock('../utils/fetchers', () => ({
  examsFetcher: (...args) => fetcher(...args),
  examDetailFetcher: vi.fn(),
}));

function ExamProbe() {
  const { exams, isLoading } = useExams(
    { cacheTest: 'remount' },
    { dedupingInterval: 0 }
  );
  return <div>{isLoading ? 'loading' : exams[0]?.title || 'empty'}</div>;
}

describe('useExams cache policy', () => {
  it('keeps cached data stable on page remounts', () => {
    expect(SWR_CONFIG.revalidateIfStale).toBe(false);
    expect(SWR_CONFIG.revalidateOnFocus).toBe(false);
  });

  it('does not refetch cached exam data when the page remounts', async () => {
    const firstRender = render(<ExamProbe />);
    await waitFor(() => expect(screen.getByText('Cached Exam')).toBeInTheDocument());
    firstRender.unmount();

    render(<ExamProbe />);
    await waitFor(() => expect(screen.getByText('Cached Exam')).toBeInTheDocument());

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
