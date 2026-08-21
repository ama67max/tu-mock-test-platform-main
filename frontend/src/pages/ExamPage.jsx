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
            const status = onlineError?.response?.status;
            const serverMessage = onlineError?.response?.data?.message || onlineError?.response?.data?.error;

            if (status === 400 || status === 403 || status === 404) {
              if (isMounted) {
                setInitError(serverMessage || 'This exam is unavailable right now.');
              }
              return;
            }

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
  const handleSelectAnswer = useCallback(
    async (value) => {
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
            timeTakenSec: 0,
          });
        } catch (err) {
          console.warn('Backend answer sync delayed; saved locally in IndexedDB:', err);
        }
      }
    },
    [currentQuestion, examId, isOnline, isOfflineAttempt, examState.setAnswer, examState.saveAnswer, examState.attemptId]
  );

  const handleToggleReview = useCallback(() => {
    const questionId = currentQuestion?._id || currentQuestion?.id;
    if (!questionId) return;
    examState.toggleReviewFlag(questionId);
  }, [currentQuestion, examState.toggleReviewFlag]);

  // Submit Exam (Online direct submit vs Offline sync queue)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitNotice('');

    try {
      if (isOnline && !isOfflineAttempt) {
        const elapsedSeconds = examState.startedAt
          ? Math.max(0, Math.floor((Date.now() - new Date(examState.startedAt).getTime()) / 1000))
          : 0;
        const attemptId = examState.attemptId;

        await examState.submitExam({
          attemptId,
          timeTakenSec: elapsedSeconds,
        });
        navigate(`/results/${attemptId}`);
      } else {
        // Offline Submission Fallback: Store payload in IndexedDB Sync Queue
        const attemptId = examState.attemptId;
        const submissionPayload = {
          attemptId,
          examId,
          answers: examState.answers,
          submittedAt: new Date().toISOString(),
        };

        await dbManager.addToSyncQueue('SUBMIT_EXAM', submissionPayload);
        await dbManager.markAnswersSynced(attemptId);

        setSubmitNotice(
          'Attempt submitted offline! Your submission has been safely stored and will automatically sync when online.'
        );

        setTimeout(() => {
          examState.resetExam();
          navigate(`/results/${attemptId}`);
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
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-on-surface">
        <div className="w-full max-w-md rounded-lg border border-surface-variant bg-surface-container-lowest p-6 text-center shadow-sm">
          <WifiOff className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-subheading font-bold text-on-surface">Unavailable Offline</h2>
          <p className="mt-2 text-body text-secondary">{initError}</p>
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

      <main aria-labelledby="exam-session-title" className="mx-auto max-w-[1280px] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface-container-lowest p-4 shadow-sm sm:mb-8 sm:p-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-primary bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-primary">
                Mock test in progress
              </span>

              {isOfflineAttempt ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-surface-variant bg-surface-container-highest px-3 py-1 text-xs font-bold text-on-surface">
                  <HardDrive size={12} />
                  <span>Offline mode</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-surface-variant bg-surface-container-highest px-3 py-1 text-xs font-bold text-on-surface">
                  <CheckCircle2 size={12} />
                  <span>Progress auto-saved</span>
                </span>
              )}
            </div>

            <h1 id="exam-session-title" className="font-headline text-heading font-bold text-primary page-reveal">
              {examState.exam?.title || 'Mock Examination'}
            </h1>
            <p className="mt-1 text-body text-secondary">
              Your answers are saved after every selection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="min-h-11 w-full sm:w-auto"
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
          <div className="mt-6 border border-primary bg-surface-container-highest p-4 text-center text-sm font-bold text-primary animate-fade-in">
            {submitNotice}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="min-w-0 space-y-5 page-reveal page-reveal-delay-1 sm:space-y-6">
            <ExamTimer seconds={examState.timeRemainingSeconds || 0} label="Time Remaining" />

            <QuestionPanel
              question={currentQuestion}
              selectedValue={selectedValue}
              isMarkedForReview={Boolean(
                examState.markedForReview?.[currentQuestion?._id || currentQuestion?.id]
              )}
              onSelect={handleSelectAnswer}
              onToggleReview={handleToggleReview}
            />

            <div className="rounded-xl border border-border bg-surface-container-lowest p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Question {examState.currentIndex + 1} of {examState.questions.length}
                </span>

                <div className="flex w-full items-stretch gap-2 sm:w-auto sm:items-center sm:gap-3">
                  <Button
                    variant="secondary"
                    disabled={examState.currentIndex === 0}
                    onClick={() => examState.prevQuestion()}
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <Button
                    disabled={examState.currentIndex === examState.questions.length - 1}
                    onClick={() => examState.nextQuestion()}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Progress bar: quick visual read on how far through the exam the
                  candidate is, complementing the numeric counter above */}
              <div className="mt-4 h-1 w-full overflow-hidden bg-surface-container-low">
                <div
                  className="h-full bg-primary transition-[width] duration-300 ease-out"
                  style={{
                    width: `${((examState.currentIndex + 1) / Math.max(1, examState.questions.length)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-5 page-reveal page-reveal-delay-2 sm:space-y-6 xl:sticky xl:top-20 xl:self-start">
            <ExamNavigation
              questions={examState.questions}
              currentIndex={examState.currentIndex}
              answers={examState.answers}
              markedForReview={examState.markedForReview}
              onSelect={examState.goToQuestion}
            />

            <div className="rounded-xl border border-border bg-surface-container-lowest p-4 shadow-sm sm:p-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Finish test
                  </span>
                  <h2 className="mt-1 text-subheading font-bold text-primary">Ready to submit?</h2>
                  <p className="mt-1 text-xs text-secondary">
                    Review your answers and flagged questions before you submit.
                  </p>
                </div>

                <Button fullWidth isLoading={isSubmitting} onClick={handleSubmit}>
                  <Send size={16} />
                  <span>Submit exam</span>
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