import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/dashboard/StatCard';

describe('StatCard', () => {
  it('renders title and value with suffix', () => {
    render(<StatCard title="Avg Score" value={78.4} suffix="%" />);
    expect(screen.getByText('Avg Score')).toBeInTheDocument();
    expect(screen.getByText('78.4')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<StatCard title="Users" loading={true} />);
    // skeleton is a div with animate-pulse class
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });
});
