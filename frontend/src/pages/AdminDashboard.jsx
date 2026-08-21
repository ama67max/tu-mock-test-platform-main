import React from 'react';
import UserTable from '../components/admin/UserTable';
import { useAdminDashboardData } from '../hooks/useAdminData';

export default function AdminDashboard() {
  const { stats, users, isLoading: loading } = useAdminDashboardData();

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <header className="rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-3xl font-black text-primary">Admin Dashboard</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Platform overview — users, exams, and activity at a glance.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">group</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Total Users</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalUsers ?? '-'}
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">assignment</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Total Exams</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalExams ?? '-'}
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">database</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Questions</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalQuestions ?? '-'}
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">sensors</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Active Attempts</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.activeAttempts ?? '-'}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
        <div className="mb-4 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Activity</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Recent registrations</h3>
        </div>
        <UserTable users={users} loading={loading} />
      </div>
    </div>
  );
}
