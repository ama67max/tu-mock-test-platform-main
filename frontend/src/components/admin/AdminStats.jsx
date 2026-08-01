import React from 'react';
import StatCard from '../dashboard/StatCard';

export default function AdminStats({ stats = {}, loading = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={stats.users ?? '-'} loading={loading} />
      <StatCard title="Total Exams" value={stats.exams ?? '-'} loading={loading} />
      <StatCard title="Total Questions" value={stats.questions ?? '-'} loading={loading} />
      <StatCard title="Active Attempts" value={stats.activeAttempts ?? '-'} loading={loading} />
    </div>
  );
}
