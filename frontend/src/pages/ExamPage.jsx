import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, WifiOff, Send, HardDrive } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useExam } from '../hooks/useExam';
import ExamTimer from '../components/exam/ExamTimer';
import QuestionPanel from '../components/exam/QuestionPanel';
import ExamNavigation from '../components/exam/ExamNavigation';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import dbManager from '../utils/indexedDB';

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const examState = useExam();
  const { isOnline } = useOnlineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState('');
  const [isOfflineAttempt, setIsOfflineAttempt] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');

  // Start Exam session (Online with IndexedDB cache fallback)
  useEffect(() => {
    let isMounted = true;

    const startExam = async () => {
      if (!examId) return;
      setInitError('');

      try {
        if (isOnline) {
          try {
            const examData = await examState.startExamAttempt({ examId });
            // Cache exam & questions to IndexedDB for offline resilience
            if (examData?.exam && examData?.questions) {
              await dbManager.cacheExam(examData.exam, examData.questions);
            }
            if (isMounted) setIsOfflineAttempt(false);
            return;
          } catch (onlineError) {
            console.warn('Online start failed, attempting IndexedDB offline cache:', onlineError);
          }
        }

        // Offline or Online network fallback to IndexedDB
        const cachedExam = await dbManager.getCachedExam(examId);
        if (cachedExam && cachedExam.exam && cachedExam.questions?.length > 0) {
          const offlineAttemptId = `offline-attempt-${examId}-${Date.now()}`;
          const durationSeconds = cachedExam.exam.durationMinutes
            ? cachedExam.exam.durationMinutes * 60
            : 3600;

          // Retrieve any existing offline saved answers for this attempt
          const localAnswers = await dbManager.getAttemptAnswers(offlineAttemptId);
          const answerMap = {};
          localAnswers.forEach((a) => {
            answerMap[a.questionId] = a.selectedOption;
          });

          examState.startExam({
            exam: cachedExam.exam,
            questions: cachedExam.questions,
            attemptId: offlineAttemptId,
            durationSeconds,
          });

          // Restore saved answers into Zustand state
          Object.entries(answerMap).forEach(([qId, val]) => {
            examState.setAnswer(qId, val);
          });

          if (isMounted) setIsOfflineAttempt(true);
        } else {
          if (isMounted) {
            setInitError(
              'Exam could not be loaded. Please connect to the internet or prefetch the exam first.'
            );
          }
        }
      } catch (err) {
        console.error('Failed to initialize exam:', err);
        if (isMounted) {
          setInitError('An unexpected error occurred while setting up the exam session.');
        }
      }
    };

    startExam();

    return () => {
      isMounted = false;
    };
  }, [examId, isOnline]);

  // Timer Tick effect
  useEffect(() => {
    if (examState.status !== 'in_progress') return;

    const timer = setInterval(() => {
      if (examState.timeRemainingSeconds <= 1) {
        clearInterval(timer);
        handleSubmit();
      } else {
        examState.tickTimer();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.status, examState.timeRemainingSeconds]);

  const currentQuestion = useMemo(() => {
    return examState.questions?.[examState.currentIndex] || null;
  }, [examState.currentIndex, examState.questions]);

  const selectedValue = useMemo(() => {
    const questionId = currentQuestion?._id || currentQuestion?.id;
    return questionId ? examState.answers?.[questionId] : undefined;
  }, [currentQuestion, examState.answers]);

  // Handle Answer Selection with continuous IndexedDB persistence
  const handleSelectAnswer = async (value) => {
    const questionId = currentQuestion?._id || currentQuestion?.id;
    if (!questionId) return;

    // 1. Update Zustand store state
    examState.setAnswer(questionId, value);

    // 2. Persist to local IndexedDB store immediately
    await dbManager.saveAnswer(examState.attemptId || `attempt-${examId}`, questionId, value);

    // 3. If online, sync attempt answer to backend API silently
    if (isOnline && !isOfflineAttempt) {
      try {
        await examState.saveAnswer({
          attemptId: examState.attemptId,
          questionId,
          selectedOption: value,
        });
      } catch (err) {
        console.warn('Backend answer sync delayed; saved locally in IndexedDB:', err);
      }
    }
  };

  const handleToggleReview = () => {
    const questionId = currentQuestion?._id || currentQuestion?.id;
    if (!questionId) return;
    examState.toggleReviewFlag(questionId);
  };

  // Submit Exam (Online direct submit vs Offline sync queue)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitNotice('');

    try {
      if (isOnline && !isOfflineAttempt) {
        await examState.submitExam({ attemptId: examState.attemptId });
        navigate(`/dashboard`);
      } else {
        // Offline Submission Fallback: Store payload in IndexedDB Sync Queue
        const submissionPayload = {
          attemptId: examState.attemptId,
          examId,
          answers: examState.answers,
          submittedAt: new Date().toISOString(),
        };

        await dbManager.addToSyncQueue('SUBMIT_EXAM', submissionPayload);
        await dbManager.markAnswersSynced(examState.attemptId);

        setSubmitNotice(
          'Attempt submitted offline! Your submission has been safely stored and will automatically sync when online.'
        );

        setTimeout(() => {
          examState.resetExam();
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      console.warn('Submission network failure; queuing offline:', err);

      try {
        await dbManager.addToSyncQueue('SUBMIT_EXAM', {
          attemptId: examState.attemptId,
          examId,
          answers: examState.answers,
          submittedAt: new Date().toISOString(),
        });
        setSubmitNotice(
          'Connection lost during submit. Your exam was saved locally and will auto-sync.'
        );
        setTimeout(() => {
          examState.resetExam();
          navigate('/dashboard');
        }, 3000);
      } catch (queueErr) {
        alert('Failed to save submission offline. Please check your storage settings.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-surface-variant bg-surface-container-lowest p-8 text-center shadow-sm">
          <WifiOff className="mx-auto h-12 w-12 text-error mb-4" />
          <h2 className="text-xl font-bold text-on-surface">Unavailable Offline</h2>
          <p className="mt-2 text-sm text-secondary">{initError}</p>
          <Button className="mt-6" fullWidth onClick={() => navigate('/exams')}>
            Return to Exam Library
          </Button>
        </div>
      </div>
    );
  }

  if (examState.isLoading || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        <LoadingSpinner size="lg" label="Preparing your mock exam..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <OfflineIndicator variant="compact" position="top-right" showOnline={false} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Header Card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-surface-variant pb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary border border-surface-variant">
                Live Exam Session
              </span>

              {isOfflineAttempt ? (
                <span className="flex items-center gap-1 rounded-lg bg-surface-container-highest px-2.5 py-1.5 text-xs font-semibold text-on-surface border border-surface-variant">
                  <HardDrive size={12} />
                  <span>Offline Storage Mode</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-surface-container-highest px-2.5 py-1.5 text-xs font-semibold text-on-surface border border-surface-variant">
                  <CheckCircle2 size={12} />
                  <span>Live Online Sync</span>
                </span>
              )}
            </div>

            <h1 className="font-headline text-3xl font-black text-primary">
              {examState.exam?.title || 'Mock Examination'}
            </h1>
            <p className="font-sans text-sm text-secondary mt-1">
              Answers auto-save to local storage on every selection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to exit? Unsubmitted progress is stored locally.')) {
                  navigate('/exams');
                }
              }}
            >
              Exit Session
            </Button>
          </div>
        </div>

        {submitNotice && (
          <div className="mt-6 rounded-xl border border-surface-variant bg-surface-container-highest p-4 text-center text-sm font-medium text-on-surface shadow-sm animate-fade-in">
            {submitNotice}
          </div>
        )}

        {/* Main Grid Section */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr] mt-8">
          <div className="space-y-6">
            {/* Themed Timer */}
            <ExamTimer seconds={examState.timeRemainingSeconds || 0} label="Time Remaining" />

            {/* Active Question Panel */}
            <QuestionPanel
              question={currentQuestion}
              selectedValue={selectedValue}
              isMarkedForReview={Boolean(
                examState.markedForReview?.[currentQuestion?._id || currentQuestion?.id]
              )}
              onSelect={handleSelectAnswer}
              onToggleReview={handleToggleReview}
            />

            {/* Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Question {examState.currentIndex + 1} of {examState.questions.length}
              </span>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  disabled={examState.currentIndex === 0}
                  onClick={() => examState.prevQuestion()}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </Button>

                <Button
                  disabled={examState.currentIndex === examState.questions.length - 1}
                  onClick={() => examState.nextQuestion()}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation & Submission Card */}
          <div className="space-y-6">
            <ExamNavigation
              questions={examState.questions}
              currentIndex={examState.currentIndex}
              answers={examState.answers}
              markedForReview={examState.markedForReview}
              onSelect={examState.goToQuestion}
            />

            {/* Submission Card */}
            <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl shadow-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Finish Session
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-primary">Ready to Submit?</h2>
                  <p className="mt-1 text-xs text-secondary">
                    Review your answered items in the navigation grid before final submission.
                  </p>
                </div>

                <Button fullWidth isLoading={isSubmitting} onClick={handleSubmit}>
                  <Send size={16} />
                  <span>Submit Final Exam</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExamPage;

