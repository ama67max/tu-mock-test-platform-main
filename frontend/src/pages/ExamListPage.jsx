import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HardDriveDownload, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import { getExams, getExamById } from '../api/examApi';
import ExamCard from '../components/exam/ExamCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useExamCache } from '../hooks/useIndexedDB';
import dbManager from '../utils/indexedDB';
import examCache from '../utils/examCache';

function ExamListPage() {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const { cacheStats, refreshStats } = useExamCache();

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

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    try {
      if (isOnline) {
        const { data } = await getExams({ published: true });
        const list = data?.data?.exams || data?.data || [];
        setExams(list);
      } else {
        // Fallback to IndexedDB cached exams when offline
        const cachedList = await dbManager.getCachedExams();
        if (cachedList && cachedList.length > 0) {
          setExams(cachedList);
        } else {
          setExams([]);
          setError('You are offline and no exams are saved in offline storage.');
        }
      }
    } catch (err) {
      console.warn('Network request failed, falling back to local cache:', err);
      try {
        const cachedList = await dbManager.getCachedExams();
        if (cachedList && cachedList.length > 0) {
          setExams(cachedList);
        } else {
          setError(err?.response?.data?.message || 'Unable to load exams.');
        }
      } catch (dbErr) {
        setError('Failed to retrieve exams from offline storage.');
      }
    } finally {
      setLoading(false);
      refreshStats();
    }
  };

  useEffect(() => {
    fetchExams();
  }, [isOnline]);

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

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-surface-variant pb-6">
          <div>
            <h1 className="font-headline text-3xl font-black text-primary">Available Mock Exams</h1>
            <p className="font-sans text-sm text-secondary mt-1">Choose an exam to start practice. Cached exams remain accessible even when disconnected.</p>
          </div>

          <div
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 border text-xs font-semibold uppercase tracking-wider ${
              isOnline
                ? 'bg-success-50 border-success-600 text-success-700'
                : 'bg-warning-50 border-warning-600 text-warning-700'
            }`}
          >
            {isOnline ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? 'Live Network Data' : 'Offline Cache Mode'}</span>
          </div>
        </div>

        {/* Search & Cache Status Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search mock exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-surface-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder-secondary focus:border-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-medium text-secondary">
              <HardDriveDownload size={16} className="text-primary" />
              <span>{cacheStats?.cachedExamsCount || 0} / 5 Cached</span>
            </div>

            <button
              type="button"
              onClick={fetchExams}
              className="flex items-center gap-2 rounded-lg border border-surface-variant bg-surface-container-lowest px-4 py-2.5 text-xs font-semibold text-on-surface hover:border-outline hover:bg-surface-container transition-all"
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
          <div className="mt-8 rounded-xl border border-danger-600 bg-danger-50 p-8 text-center shadow-sm">
            <p className="text-base text-danger-700">{error}</p>
            <button
              type="button"
              onClick={fetchExams}
              className="mt-4 rounded-lg border border-danger-600 bg-danger-100 px-4 py-2 text-xs font-semibold text-danger-700 hover:bg-danger-50"
            >
              Try Again
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-surface-variant bg-surface-container-low p-12 text-center text-secondary">
            <p className="text-base font-medium">No exams found matching your query.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
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
                  onStart={() => navigate(`/exam/${examId}`)}
                  actionLabel={isCached ? 'Start Exam (Offline Ready)' : 'Start Exam'}
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

