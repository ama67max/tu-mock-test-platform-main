import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import SubjectBreakdown from '../components/dashboard/SubjectBreakdown';
import RecentAttempts from '../components/dashboard/RecentAttempts';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import * as analyticsApi from '../api/analyticsApi';
import * as resultApi from '../api/resultApi';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoadingKpis(true);
      setLoadingAttempts(true);
      setLoadingCharts(true);

      try {
        const [statsRes, attemptsRes] = await Promise.all([
          analyticsApi.getDashboardStats(),
          resultApi.getResults({ page: 1, limit: 6 }),
        ]);

        if (!mounted) return;
        setKpis(statsRes?.data || {});
        setRecentAttempts(attemptsRes?.data || []);

        const examId = statsRes?.data?.defaultExamId;
        if (examId) {
          const [trendRes, subjectRes] = await Promise.all([
            analyticsApi.getTrendData({ examId, range: '30d' }),
            analyticsApi.getSubjectBreakdown(examId),
          ]);
          if (!mounted) return;
          setTrendData(trendRes?.data || []);
          setSubjectData(subjectRes?.data || []);
        } else {
          setTrendData([]);
          setSubjectData([]);
        }
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        if (mounted) {
          setLoadingKpis(false);
          setLoadingCharts(false);
          setLoadingAttempts(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function onViewAttempt(attemptId) {
    console.log('View attempt', attemptId);
  }

  const avgScore = kpis?.avgScore ?? '-';
  const totalAttempts = kpis?.totalAttempts ?? '-';
  const passRate = kpis?.passRate ? `${kpis.passRate}%` : '-';
  const activeUsers = kpis?.activeUsers ?? '-';

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-surface-variant pb-6">
          <div>
            <h1 className="font-headline text-3xl font-black text-primary">Student Analytics Dashboard</h1>
            <p className="font-sans text-sm text-secondary mt-1">Track your TU mock test score trends and recent performance</p>
          </div>

          <div className="bg-surface-container-highest px-4 py-2.5 rounded-lg flex items-center gap-2 border border-surface-variant">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <span className="font-semibold text-xs text-primary uppercase tracking-wider">
              {isOnline ? 'Live Network Data' : 'Offline Cache Mode'}
            </span>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Avg Score</span>
            <div className="mt-2 font-headline text-3xl font-black text-primary">{avgScore}%</div>
            <p className="text-[11px] text-secondary mt-1">Average Across Attempts</p>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Total Attempts</span>
            <div className="mt-2 font-headline text-3xl font-black text-primary">{totalAttempts}</div>
            <p className="text-[11px] text-secondary mt-1">Mock Tests Taken</p>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Pass Rate</span>
            <div className="mt-2 font-headline text-3xl font-black text-primary">{passRate}</div>
            <p className="text-[11px] text-secondary mt-1">Target Score Threshold</p>
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant p-5 rounded-xl shadow-sm">
            <span className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">Active Peers</span>
            <div className="mt-2 font-headline text-3xl font-black text-primary">{activeUsers}</div>
            <p className="text-[11px] text-secondary mt-1">Students Practicing</p>
          </div>
        </div>

        {/* Bento Charts & History Layout */}
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Score Trends</span>
                  <h2 className="font-headline text-xl font-bold text-primary mt-1">Progression Curve</h2>
                </div>
                <PerformanceChart data={trendData} height={280} loading={loadingCharts} />
              </div>

              <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Subject Breakdown</span>
                  <h2 className="font-headline text-xl font-bold text-primary mt-1">Topic Strength</h2>
                </div>
                <SubjectBreakdown data={subjectData} height={280} loading={loadingCharts} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Attempt History</span>
                  <h2 className="font-headline text-xl font-bold text-primary mt-1">Recent Activity</h2>
                </div>
              </div>
              <RecentAttempts attempts={recentAttempts} loading={loadingAttempts} onView={onViewAttempt} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

