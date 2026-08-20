import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div 
      className={`
        relative overflow-hidden bg-surface-container-lowest 
        border border-border p-5
        hover:border-primary transition-colors duration-300 ease-out
        group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500
      `}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-secondary font-bold">
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
            <p className="mt-2 text-[11px] font-medium text-secondary">{subtext}</p>
          </>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
        bg-surface-container-lowest border border-border p-6
        hover:border-primary transition-colors duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="relative">
        {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/90">
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

  const defaultChartHeight = windowWidth >= 1280 ? 360 : windowWidth >= 1024 ? 320 : 280;

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
  const hasNoData = !loadingKpis && (!kpis || Number(kpis.totalAttempts ?? 0) === 0);
  const chartHeight = hasNoData ? (windowWidth >= 768 ? 180 : 150) : defaultChartHeight;

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary/10">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ─── Header Section ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 pb-6 border-b border-surface-variant/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-headline text-3xl font-black tracking-tight text-primary lg:text-4xl">
                Your preparation, in focus
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
                TU mock tests
              </span>
            </div>
            <p className="font-sans text-sm text-secondary/80 max-w-md leading-relaxed">
              See your score trend, subject accuracy, and time per question so every new mock test has a clear purpose.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`
              bg-surface-container-highest px-4 py-2.5 rounded-xl flex items-center gap-2.5 
              border shadow-sm transition-all duration-300
              border-border
            `}>
              <span className={`
                relative flex h-2.5 w-2.5
                text-primary
              `}>
                <span className={`
                  animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                  bg-primary
                `} />
                <span className={`
                  relative inline-flex rounded-full h-2.5 w-2.5
                  bg-primary
                `} />
              </span>
              <span className="font-semibold text-xs uppercase tracking-wider text-primary">
                {isOnline ? 'Progress synced' : 'Offline cache active'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Empty State ───────────────────────────────────────── */}
        {hasNoData && (
          <div className="mb-8 flex flex-col gap-5 border border-dashed border-surface-variant bg-surface-container-lowest/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <span className="material-symbols-outlined mb-3 block text-3xl text-secondary/50">analytics</span>
              <h3 className="mb-1 font-headline text-lg font-bold text-primary">Your first baseline is waiting</h3>
              <p className="max-w-md text-sm text-secondary">Start a mock test to unlock score trends and subject insights.</p>
            </div>
            <Link to="/exams" className="btn-primary min-h-11 shrink-0 px-5 py-3 text-sm">
              Start mock test
            </Link>
          </div>
        )}

        {/* ─── Stats Summary Grid ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 mb-10">
          <StatCard 
            label="Average score" 
            value={avgScore} 
            suffix="%" 
            subtext="Across completed attempts"
            loading={loadingKpis}
            delay={0}
            icon="trending_up"
            color="primary"
          />
          <StatCard 
            label="Mock tests taken" 
            value={totalAttempts} 
            subtext="Completed sessions"
            loading={loadingKpis}
            delay={100}
            icon="fact_check"
            color="info"
          />
          <StatCard 
            label="Answer accuracy" 
            value={passRate} 
            suffix="%" 
            subtext="Correct answers"
            loading={loadingKpis}
            delay={200}
            icon="check_circle"
            color="success"
          />
          <StatCard 
            label="Study time" 
            value={timeSpentMinutes} 
            subtext="Minutes in practice"
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
          <p>Progress updates automatically after each completed mock test.</p>
          <p className="font-mono">TU / analytics</p>
        </div>
      </main>
    </div>
  );
}