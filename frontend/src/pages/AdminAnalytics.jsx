import React, { useEffect, useState } from 'react';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import SubjectBreakdown from '../components/dashboard/SubjectBreakdown';
import * as analyticsApi from '../api/analyticsApi';
import { useAdminAnalyticsDefaults } from '../hooks/useAdminData';

export default function AdminAnalytics() {
  const [examId, setExamId] = useState('');
  const [trend, setTrend] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { stats } = useAdminAnalyticsDefaults();

  const defaultExamId = stats?.defaultExamId;
  useEffect(() => {
    if (!examId && defaultExamId) setExamId(String(defaultExamId));
  }, [defaultExamId, examId]);

  async function load() {
    if (!examId) return;
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        analyticsApi.getTrendData({ examId: Number(examId), range: '30d' }),
        analyticsApi.getSubjectBreakdown(Number(examId)),
      ]);
      setTrend(t?.data || []);
      setSubjects(s?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface-container-lowest p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="font-headline text-3xl font-black text-primary">Analytics Overview</h2>
          <p className="font-sans text-sm text-secondary mt-1">Real-time performance metrics and registration insights</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span className="text-secondary">Exam ID:</span>
            <input
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              placeholder="Exam ID"
              className="bg-transparent border-b border-surface-variant w-20 text-center font-bold outline-none text-primary"
            />
          </div>

          <button
            onClick={load}
            className="bg-primary text-on-primary font-semibold text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Load Analytics
          </button>
        </div>
      </header>

      {/* Analytics Charts Grid */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">30-Day Trend</span>
            <h3 className="font-headline text-xl font-bold text-primary mt-1">Score Progression</h3>
          </div>
          <PerformanceChart data={trend} height={trend.length ? 320 : 170} loading={loading} />
        </div>

        <div className="min-w-0 rounded-xl bg-surface-container-lowest border border-border p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-semibold">Subject Breakdown</span>
            <h3 className="font-headline text-xl font-bold text-primary mt-1">Topic Strength</h3>
          </div>
          <SubjectBreakdown data={subjects} height={subjects.length ? 320 : 170} loading={loading} />
        </div>
      </div>
    </div>
  );
}

