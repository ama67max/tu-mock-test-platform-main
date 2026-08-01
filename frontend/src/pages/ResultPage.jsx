import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, HardDrive } from 'lucide-react';
import Button from '../components/common/Button';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import * as resultApi from '../api/resultApi';
import dbManager from '../utils/indexedDB';

function fmt(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    return format(d, 'PPpp');
  } catch (e) {
    return '-';
  }
}

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!attemptId) {
      setError('No attempt ID provided');
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (isOnline) {
          try {
            const [resSummary, resAnswers] = await Promise.all([
              resultApi.getResult(attemptId),
              resultApi.getAttemptAnswers(attemptId),
            ]);
            if (!mounted) return;
            setSummary(resSummary?.data || resSummary);
            setAnswers(resAnswers?.data || resAnswers || []);
            setIsOfflineData(false);
            return;
          } catch (onlineErr) {
            console.warn('Online result fetch failed; checking IndexedDB:', onlineErr);
          }
        }

        // Offline or Online network fallback to IndexedDB
        const localAnswers = await dbManager.getAttemptAnswers(attemptId);
        if (localAnswers && localAnswers.length > 0) {
          if (!mounted) return;
          setIsOfflineData(true);
          setAnswers(
            localAnswers.map((a) => ({
              questionId: a.questionId,
              questionText: `Question ${a.questionId}`,
              selectedOption: a.selectedOption,
              correctAnswer: a.correctAnswer || 'N/A',
              is_correct: Boolean(a.is_correct),
              explanation: a.explanation || 'Result stored in local offline queue.',
            }))
          );
          setSummary({
            examTitle: 'Offline Mock Exam Attempt',
            score: localAnswers.filter((a) => a.is_correct).length,
            totalMarks: localAnswers.length,
            status: 'Stored Offline (Pending Sync)',
            submittedAt: localAnswers[0]?.timestamp || new Date().toISOString(),
          });
        } else {
          if (!mounted) return;
          setError('Exam result could not be retrieved offline. Complete sync when online.');
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load exam result.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [attemptId, isOnline]);

  const stats = React.useMemo(() => {
    if (!answers || answers.length === 0) return { correct: 0, incorrect: 0, accuracy: 0 };
    const correct = answers.filter((a) => a.is_correct).length;
    const incorrect = answers.length - correct;
    const accuracy = Math.round((correct / answers.length) * 100);
    return { correct, incorrect, accuracy };
  }, [answers]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <RefreshCw className="animate-spin text-sky-400" size={20} />
          <span>Retrieving exam results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-900 to-black p-8 text-center shadow-2xl">
          <p className="text-base text-red-200">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/exams')}>
              <ArrowLeft size={16} />
              <span>Back to Exams</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-slate-800">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <div className="container mx-auto px-4 py-10 lg:px-8 max-w-7xl">
        {/* Header Banner */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/10">
                  Performance Report
                </span>

                {isOfflineData ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                    <HardDrive size={12} />
                    <span>Cached Local Result</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 size={12} />
                    <span>Synced to Server</span>
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white mt-2">Exam Results & Score</h1>
              <p className="text-base text-slate-300">
                Detailed breakdown of your score, accuracy, and answered questions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/exams')}>
                <ArrowLeft size={16} />
                <span>Back to Library</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Score Overview Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Score</span>
              <Award className="text-amber-400" size={20} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {summary?.score ?? stats.correct}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / {summary?.totalMarks ?? summary?.exam?.totalMarks ?? answers.length}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Overall Points Earned</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Accuracy Rate</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-sky-400">{stats.accuracy}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Correct Answers</span>
            <div className="mt-4 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={32} />
              <span className="text-4xl font-bold text-emerald-300">{stats.correct}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Questions Answered Correctly</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Incorrect Items</span>
            <div className="mt-4 flex items-center gap-3">
              <XCircle className="text-rose-400" size={32} />
              <span className="text-4xl font-bold text-rose-300">{stats.incorrect}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Needs Review & Study</p>
          </div>
        </div>

        {/* Detailed Answer Review Section */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Answer Review</h2>
              <p className="text-sm text-slate-400 mt-1">Review each question along with your choice and explanations.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {answers.map((a, idx) => (
              <div
                key={a.questionId || idx}
                className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 transition hover:border-slate-400/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                        Item {idx + 1}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-white leading-relaxed">{a.questionText}</p>

                    <div className="flex flex-wrap gap-4 text-sm pt-2">
                      <span className="text-slate-300">
                        Selected Choice:{' '}
                        <strong className="text-white">{String(a.selectedOption ?? 'None')}</strong>
                      </span>

                      {a.correctAnswer && (
                        <span className="text-slate-300">
                          Correct Choice:{' '}
                          <strong className="text-emerald-300">{String(a.correctAnswer)}</strong>
                        </span>
                      )}
                    </div>

                    {a.explanation && (
                      <div className="mt-3 rounded-xl bg-slate-900 p-3 text-xs text-slate-300 border border-white/5">
                        <strong className="text-slate-200">Explanation: </strong>
                        {a.explanation}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {a.is_correct ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 size={14} />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
                        <XCircle size={14} />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
