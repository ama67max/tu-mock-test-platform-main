import React, { useMemo, useState, useEffect } from 'react';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import SubjectBreakdown from '../components/dashboard/SubjectBreakdown';
import RecentAttempts from '../components/dashboard/RecentAttempts';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useMyAnalytics, useMyTrends, useMyResults } from '../hooks/useAnalytics';

// ─── Animated Counter Hook ─────────────────────────────────────
function useAnimatedValue(target, duration = 800) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    if (target === null || target === '-' || typeof target !== 'number') {
      setDisplay(target);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (target - start) * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  
  return display;
}

// ─── Skeleton Pulse Component ──────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-surface-variant/60 rounded-md ${className}`} />
  );
}

// ─── Stat Card Component ───────────────────────────────────────
function StatCard({ label, value, suffix, subtext, loading, delay = 0, icon, color = 'primary' }) {
  const animatedValue = useAnimatedValue(value);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorStyles = {
    primary: 'from-primary/5 to-primary/0 text-primary border-primary/10',
    success: 'from-emerald-500/5 to-emerald-500/0 text-emerald-600 border-emerald-500/10',
    warning: 'from-amber-500/5 to-amber-500/0 text-amber-600 border-amber-500/10',
    info: 'from-sky-500/5 to-sky-500/0 text-sky-600 border-sky-500/10',
  };

  return (
    <div 
      className={`
        relative overflow-hidden bg-surface-container-lowest 
        border border-surface-variant p-5 rounded-2xl shadow-sm
        hover:shadow-md hover:border-surface-variant/80
        hover:-translate-y-0.5 transition-all duration-300 ease-out
        group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500
      `}
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorStyles[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-sans text-[11px] uppercase tracking-widest text-secondary font-bold">
            {label}
          </span>
          {icon && (
            <span className="material-symbols-outlined text-secondary/40 group-hover:text-secondary/70 transition-colors text-lg">
              {icon}
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <div className="font-headline text-4xl font-black text-primary tracking-tight">
              {value === null || value === '-' ? (
                <span className="text-secondary/30">-</span>
              ) : (
                <>
                  <span>{animatedValue}</span>
                  {suffix && <span className="text-xl align-top ml-1 text-secondary/60">{suffix}</span>}
                </>
              )}
            </div>
            <p className="text-[11px] text-secondary/70 mt-2 font-medium">{subtext}</p>
          </>
        )}
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colorStyles[color].split(' ')[0].replace('/5', '/40')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}

// ─── Section Header Component ──────────────────────────────────
function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-secondary/60 block mb-1">
          {eyebrow}
        </span>
        <h2 className="font-headline text-xl font-bold text-primary tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── Chart Card Wrapper ────────────────────────────────────────
function ChartCard({ children, eyebrow, title, loading, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        bg-surface-container-lowest border border-surface-variant p-6 rounded-2xl shadow-sm
        hover:shadow-md transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-secondary font-medium">Loading data...</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isOnline } = useOnlineStatus();

  // Responsive chart height: give more vertical room on larger screens so curves and labels don't get squeezed
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartHeight = windowWidth >= 1280 ? 360 : windowWidth >= 1024 ? 320 : 280;

  // Use SWR hooks for data fetching with caching
  const { analytics: kpis, isLoading: loadingKpis } = useMyAnalytics();
  const { trends: trendData, isLoading: loadingCharts } = useMyTrends(30);
  const { results: recentAttempts, isLoading: loadingAttempts } = useMyResults({ page: 1, limit: 6 });

  // Normalize subject data for the chart component
  const subjectData = useMemo(() => {
    if (!kpis?.subjectBreakdown) return [];
    return kpis.subjectBreakdown.map((item) => ({
      subject: item.name,
      avgScore: item.averageScore ?? item.avgScore ?? 0,
      questionCount: item.totalQuestions ?? item.questionCount ?? 0,
    }));
  }, [kpis?.subjectBreakdown]);

  function onViewAttempt(attemptId) {
    console.log('View attempt', attemptId);
  }

  const avgScore = kpis?.averageScore ?? kpis?.avgScore ?? null;
  const totalAttempts = kpis?.totalAttempts ?? '-';
  const passRate = kpis?.accuracy ?? kpis?.passRate ?? null;
  const timeSpentMinutes = kpis?.totalTimeSpentMinutes ?? '-';

  // Determine if we have any data at all
  const hasNoData = !loadingKpis && !kpis;

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary/10">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ─── Header Section ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 pb-6 border-b border-surface-variant/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-headline text-3xl lg:text-4xl font-black text-primary tracking-tight">
                Student Analytics Dashboard
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
                TU Mock Tests
              </span>
            </div>
            <p className="font-sans text-sm text-secondary/80 max-w-md leading-relaxed">
              Track your mock test score trends, identify subject strengths, and monitor your progression over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`
              bg-surface-container-highest px-4 py-2.5 rounded-xl flex items-center gap-2.5 
              border shadow-sm transition-all duration-300
              ${isOnline 
                ? 'border-emerald-500/20 shadow-emerald-500/5' 
                : 'border-amber-500/20 shadow-amber-500/5'
              }
            `}>
              <span className={`
                relative flex h-2.5 w-2.5
                ${isOnline ? 'text-emerald-500' : 'text-amber-500'}
              `}>
                <span className={`
                  animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                  ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}
                `} />
                <span className={`
                  relative inline-flex rounded-full h-2.5 w-2.5
                  ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}
                `} />
              </span>
              <span className="font-semibold text-xs uppercase tracking-wider text-primary">
                {isOnline ? 'Live Network Data' : 'Offline Cache Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Empty State ───────────────────────────────────────── */}
        {hasNoData && (
          <div className="mb-8 p-8 rounded-2xl border border-dashed border-surface-variant bg-surface-container-lowest/50 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary/30 mb-3 block">analytics</span>
            <h3 className="font-headline text-lg font-bold text-primary mb-1">No Data Available</h3>
            <p className="text-sm text-secondary">Start taking mock tests to see your analytics here.</p>
          </div>
        )}

        {/* ─── Stats Summary Grid ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 mb-10">
          <StatCard 
            label="Avg Score" 
            value={avgScore} 
            suffix="%" 
            subtext="Average Across Attempts"
            loading={loadingKpis}
            delay={0}
            icon="trending_up"
            color="primary"
          />
          <StatCard 
            label="Total Attempts" 
            value={totalAttempts} 
            subtext="Mock Tests Taken"
            loading={loadingKpis}
            delay={100}
            icon="fact_check"
            color="info"
          />
          <StatCard 
            label="Accuracy" 
            value={passRate} 
            suffix="%" 
            subtext="Answer Accuracy Rate"
            loading={loadingKpis}
            delay={200}
            icon="check_circle"
            color="success"
          />
          <StatCard 
            label="Time Spent" 
            value={timeSpentMinutes} 
            subtext="Minutes Total"
            loading={loadingKpis}
            delay={300}
            icon="schedule"
            color="warning"
          />
        </div>

        {/* ─── Bento Charts & History Layout ─────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard 
                eyebrow="Score Trends" 
                title="Progression Curve" 
                loading={loadingCharts}
                delay={400}
              >
                <PerformanceChart data={trendData} height={chartHeight} loading={loadingCharts} />
              </ChartCard>

              <ChartCard 
                eyebrow="Subject Breakdown" 
                title="Topic Strength" 
                loading={loadingCharts}
                delay={500}
              >
                <SubjectBreakdown data={subjectData} height={chartHeight} loading={loadingCharts} />
              </ChartCard>
            </div>
          </div>

          <div className="space-y-6">
            <ChartCard 
              eyebrow="Attempt History" 
              title="Recent Activity" 
              loading={loadingAttempts}
              delay={600}
            >
              <RecentAttempts 
                attempts={recentAttempts} 
                loading={loadingAttempts} 
                onView={onViewAttempt} 
              />
            </ChartCard>
          </div>
        </div>

        {/* ─── Footer ────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-surface-variant/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-secondary/50">
          <p>Dashboard updates automatically as you complete new tests.</p>
          <p className="font-mono">v2.0 • TU Analytics</p>
        </div>
      </main>
    </div>
  );
}