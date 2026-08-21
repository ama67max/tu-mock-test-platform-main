import React from 'react';
import { render, screen } from '@testing-library/react';
import ExamNavigation from '../components/exam/ExamNavigation';

describe('ExamNavigation accessibility', () => {
  it('labels question controls and exposes the current question', () => {
    render(
      <ExamNavigation
        questions={[{ id: 'q1' }, { id: 'q2' }]}
        currentIndex={1}
        answers={{ q1: 'A' }}
        markedForReview={{}}
      />
    );

    expect(screen.getByRole('button', { name: 'Question 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Question 2, current question' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  });
});
