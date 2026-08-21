import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HardDriveDownload, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import { getExamById } from '../api/examApi';
import ExamCard from '../components/exam/ExamCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useExamCache } from '../hooks/useIndexedDB';
import { useExams } from '../hooks/useExams';
import dbManager from '../utils/indexedDB';
import examCache from '../utils/examCache';

function ExamListPage() {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const { cacheStats, refreshStats } = useExamCache();

  // Use SWR hook for exams with caching
  const { exams: swrExams, isLoading, error: swrError, refresh } = useExams({ isPublished: true });

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cachingExamId, setCachingExamId] = useState(null);

  // Set of cached exam IDs for quick lookup
  const cachedExamIds = useMemo(() => {
    const ids = new Set();
    if (cacheStats?.cachedExams) {
      cacheStats.cachedExams.forEach((e) => ids.add(String(e.id || e._id)));
    }
    return ids;
  }, [cacheStats]);

  // Sync SWR data with local state and handle offline fallback
  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      setError('');

      if (!isOnline) {
        // Offline mode: load from IndexedDB
        try {
          const cachedList = await dbManager.getCachedExams();
          if (cachedList && cachedList.length > 0) {
            setExams(cachedList);
          } else {
            setExams([]);
            setError('You are offline and no exams are saved in offline storage.');
          }
        } catch (dbErr) {
          setError('Failed to retrieve exams from offline storage.');
        }
        setLoading(false);
        return;
      }

      // Online mode: use SWR data
      if (swrError) {
        // SWR failed, try IndexedDB fallback
        console.warn('SWR request failed, falling back to local cache:', swrError);
        try {
          const cachedList = await dbManager.getCachedExams();
          if (cachedList && cachedList.length > 0) {
            setExams(cachedList);
          } else {
            setError(swrError?.response?.data?.message || 'Unable to load exams.');
          }
        } catch (dbErr) {
          setError('Failed to retrieve exams from offline storage.');
        }
      } else if (swrExams && swrExams.length >= 0) {
        // Filter exams that have questions
        const filteredExams = swrExams.filter((exam) => {
          const qCount = exam?.questionsCount ?? exam?._count?.examQuestions ?? exam?.examQuestions?.length ?? 0;
          return Number(qCount) > 0;
        });
        setExams(filteredExams);
      }

      setLoading(isLoading);
      if (!isLoading) {
        refreshStats();
      }
    }

    loadExams();
  }, [swrExams, isLoading, swrError, isOnline, refreshStats]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (isOnline) {
      await refresh();
    }
    refreshStats();
  };

  const handlePrefetch = async (exam) => {
    const examId = exam.id || exam._id;
    if (!examId) return;

    setCachingExamId(examId);
    try {
      await examCache.fetchExam(examId, async () => {
        const res = await getExamById(examId);
        return res?.data?.data || res?.data;
      });
      await refreshStats();
    } catch (err) {
      console.error('Failed to prefetch exam:', err);
    } finally {
      setCachingExamId(null);
    }
  };

  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams;
    const query = searchQuery.toLowerCase();
    return exams.filter(
      (exam) =>
        exam.title?.toLowerCase().includes(query) ||
        exam.description?.toLowerCase().includes(query) ||
        exam.category?.name?.toLowerCase().includes(query)
    );
  }, [exams, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <main aria-labelledby="exam-library-title" className="max-w-[1200px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-surface-variant pb-6">
          <div>
            <h1 id="exam-library-title" className="font-headline text-3xl font-black text-primary page-reveal">Available Mock Exams</h1>
            <p className="font-sans text-sm text-secondary mt-1">Choose an exam to start practice. Cached exams remain accessible even when disconnected.</p>
          </div>

          <div className="flex items-center gap-2 border border-primary bg-surface-container-highest px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {isOnline ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? 'Progress synced' : 'Offline cache active'}</span>
          </div>
        </div>

        {/* Search & Cache Status Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative w-full sm:flex-1 page-reveal page-reveal-delay-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input
              aria-label="Search mock exams"
              type="text"
              placeholder="Search mock exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-surface-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder-secondary focus:border-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="flex min-h-11 flex-1 items-center justify-between gap-2 rounded-lg border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-medium text-secondary sm:flex-none">
              <HardDriveDownload size={16} className="text-primary" />
              <span>{cacheStats?.cachedExamsCount || 0} / 5 Cached</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-semibold text-on-surface hover:border-outline hover:bg-surface-container transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" label="Loading mock exams..." />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-lg border border-primary bg-surface-container-highest p-8 text-center">
            <p className="text-base text-primary">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 border border-primary bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-surface-variant bg-surface-container-low p-8 text-center text-secondary sm:p-12">
            <HardDriveDownload size={28} className="mx-auto mb-4 text-secondary/60" aria-hidden="true" />
            <p className="text-base font-medium text-primary">No exams found matching your query.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6">Published mock exams will appear here, and saved exams remain available when you are offline.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-5 min-h-11 border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div aria-live="polite" className="grid gap-6 md:grid-cols-2">
            {filteredExams.map((exam) => {
              const examId = String(exam.id || exam._id);
              const isCached = cachedExamIds.has(examId);

              return (
                <ExamCard
                  key={examId}
                  exam={exam}
                  isCached={isCached}
                  isCaching={cachingExamId === examId}
                  onPrefetch={() => handlePrefetch(exam)}
                  onStart={() => navigate(`/exams/${examId}`)}
                  actionLabel={isCached ? 'Start mock test offline' : 'Start mock test'}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default ExamListPage;

