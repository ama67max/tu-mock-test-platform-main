import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, HardDrive, AlertTriangle } from 'lucide-react';
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
              isCorrect: Boolean(a.isCorrect ?? a.is_correct),
              explanation: a.explanation || 'Result stored in local offline queue.',
            }))
          );
          setSummary({
            examTitle: 'Offline Mock Exam Attempt',
            score: localAnswers.filter((a) => Boolean(a.isCorrect ?? a.is_correct)).length,
            totalMarks: localAnswers.length,
            status: 'Stored Offline (Pending Sync)',
            submittedAt: localAnswers[0]?.timestamp || new Date().toISOString(),
          });
        } else {
          if (!mounted) return;
          setError("This result isn't available offline yet. Reconnect and we'll pull it down for you.");
        }
      } catch (e) {
        if (mounted) setError(e.message || "We couldn't load this result. Please try again.");
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
    const correct = answers.filter((a) => Boolean(a.isCorrect ?? a.is_correct)).length;
    const incorrect = answers.length - correct;
    const accuracy = Math.round((correct / answers.length) * 100);
    return { correct, incorrect, accuracy };
  }, [answers]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary">
        <div className="flex items-center gap-3 text-sm text-secondary">
          <RefreshCw className="animate-spin text-primary" size={20} />
          <span>Loading your result...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-surface-variant bg-surface-container-low p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border-shared/20">
            <AlertTriangle size={20} className="text-primary" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-primary">Result unavailable</h1>
          <p className="mt-2 text-sm text-secondary">{error}</p>
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
    <div className="min-h-screen bg-background text-primary selection:bg-primary selection:text-on-primary">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      {/* 60% — white canvas is the dominant surface the whole page sits on */}
      <div className="container mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Header — 30%: light zinc cards are the supporting surface layer */}
        <div className="rounded-3xl border border-surface-variant bg-surface-container-low p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full border border-surface-variant bg-surface-container-highest px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
                  Result Summary
                </span>

                {isOfflineData ? (
                  <span className="flex items-center gap-2 rounded-full border border-surface-variant bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-secondary">
                    <HardDrive size={12} />
                    <span>Saved offline, pending sync</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-on-primary">
                    <CheckCircle2 size={12} />
                    <span>Synced</span>
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-primary">Here's how you did</h1>
              <p className="text-base text-secondary">
                A full breakdown of your score, accuracy, and every question you answered.
              </p>
              {summary?.submittedAt && (
                <p className="text-xs text-tertiary">Submitted {fmt(summary.submittedAt)}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/exams')}>
                <ArrowLeft size={16} />
                <span>Back to Library</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            <span>Go to Dashboard</span>
          </Button>
          <Button variant="secondary" onClick={() => navigate('/exams')}>
            <RefreshCw size={16} />
            <span>Take Another Exam</span>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-surface-variant bg-surface-container-low p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Score</span>
              <Award className="text-primary/50" size={20} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {summary?.attempt?.score ?? summary?.score ?? stats.correct}
              </span>
              <span className="text-sm font-medium text-tertiary">
                / {summary?.attempt?.totalMarks ?? summary?.totalMarks ?? summary?.exam?.totalMarks ?? answers.length}
              </span>
            </div>
            <p className="mt-2 text-xs text-secondary">Points earned across the exam</p>
          </div>

          <div className="rounded-2xl border border-surface-variant bg-surface-container-low p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Accuracy</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{stats.accuracy}%</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-secondary">Share of questions answered correctly</p>
          </div>

          <div className="rounded-2xl border border-surface-variant bg-surface-container-low p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Correct</span>
              <CheckCircle2 className="text-primary/60" size={20} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{stats.correct}</span>
            </div>
            <p className="mt-2 text-xs text-secondary">Answered correctly</p>
          </div>

          <div className="rounded-2xl border border-surface-variant bg-surface-container-low p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">Incorrect</span>
              <XCircle className="text-tertiary" size={20} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-secondary">{stats.incorrect}</span>
            </div>
            <p className="mt-2 text-xs text-secondary">Flagged for review</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-surface-variant bg-surface-container-low p-8">
          <div className="border-b border-surface-variant pb-6">
            <h2 className="text-2xl font-bold text-primary">Answer Review</h2>
            <p className="mt-1 text-sm text-secondary">See what you picked, what was correct, and why.</p>
          </div>

          <div className="mt-6 space-y-4">
            {answers.map((a, idx) => (
              <div
                key={a.questionId || idx}
                className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-6 transition-colors duration-150 hover:border-border-shared"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <span className="inline-block rounded-md border border-surface-variant bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
                      Question {idx + 1}
                    </span>

                    <p className="text-base font-semibold leading-relaxed text-primary">{a.questionText}</p>

                    <div className="flex flex-wrap gap-4 pt-2 text-sm">
                      <span className="text-secondary">
                        Your answer: <strong className="text-primary">{String(a.selectedOption ?? 'None')}</strong>
                      </span>

                      {a.correctAnswer && (
                        <span className="text-secondary">
                          Correct answer: <strong className="text-primary">{String(a.correctAnswer)}</strong>
                        </span>
                      )}
                    </div>

                    {a.explanation && (
                      <div className="mt-3 rounded-xl border border-surface-variant bg-surface-container-high p-4 text-xs text-secondary">
                        <strong className="text-primary">Explanation: </strong>
                        {a.explanation}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {Boolean(a.isCorrect ?? a.is_correct) ? (
                      <span className="flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-on-primary">
                        <CheckCircle2 size={14} />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full border border-surface-variant px-3 py-1 text-xs font-semibold text-secondary">
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