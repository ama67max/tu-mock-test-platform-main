import React, { useEffect, useState } from 'react';
import UserTable from '../components/admin/UserTable';
import * as adminApi from '../api/adminApi';
import * as analyticsApi from '../api/analyticsApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const statsRes = await analyticsApi.getDashboardStats();
        const usersRes = await adminApi.getUsers({ page: 1, limit: 6 });
        if (!mounted) return;
        setStats(statsRes?.data || {});
        setUsers(usersRes?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-surface-variant pb-6">
        <h2 className="font-headline text-3xl font-black text-primary">Admin Dashboard</h2>
        <p className="font-sans text-sm text-secondary mt-1">
          Platform overview — users, exams, and activity at a glance.
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">group</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Total Users</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalUsers ?? '-'}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">assignment</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Total Exams</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalExams ?? '-'}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">database</span>
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Questions</span>
          </div>
          <div className="font-headline text-3xl font-black text-primary">
            {loading ? '...' : stats?.totalQuestions ?? '-'}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
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
      <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
        <div className="mb-4 border-b border-surface-variant pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Activity</span>
          <h3 className="font-headline text-xl font-bold text-primary mt-1">Recent Registered Users</h3>
        </div>
        <UserTable users={users} loading={loading} />
      </div>
    </div>
  );
}
