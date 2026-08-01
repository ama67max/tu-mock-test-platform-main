import { create } from 'zustand';

const initialState = {
  exam: null,
  attemptId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  markedForReview: {},
  timeRemainingSeconds: 0,
  status: 'idle',
  startedAt: null,
};

export const useExamStore = create((set, get) => ({
  ...initialState,

  // ── Lifecycle ────────────────────────────────────────────────────────
  startExam: ({ exam, questions, attemptId, durationSeconds }) =>
    set({
      exam,
      questions,
      attemptId,
      currentIndex: 0,
      answers: {},
      markedForReview: {},
      timeRemainingSeconds: durationSeconds,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    }),

  resetExam: () => set({ ...initialState }),

  setStatus: (status) => set({ status }),

  // ── Answers ──────────────────────────────────────────────────────────
  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),

  clearAnswer: (questionId) =>
    set((state) => {
      const nextAnswers = { ...state.answers };
      delete nextAnswers[questionId];
      return { answers: nextAnswers };
    }),

  // ── Review Flags ─────────────────────────────────────────────────────
  toggleReviewFlag: (questionId) =>
    set((state) => {
      const nextFlags = { ...state.markedForReview };
      if (nextFlags[questionId]) {
        delete nextFlags[questionId];
      } else {
        nextFlags[questionId] = true;
      }
      return { markedForReview: nextFlags };
    }),

  // ── Navigation ───────────────────────────────────────────────────────
  goToQuestion: (index) =>
    set((state) => {
      if (index < 0 || index >= state.questions.length) return {};
      return { currentIndex: index };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  // ── Timer ────────────────────────────────────────────────────────────
  setTimeRemaining: (seconds) => set({ timeRemainingSeconds: Math.max(0, seconds) }),

  tickTimer: () =>
    set((state) => ({
      timeRemainingSeconds: Math.max(0, state.timeRemainingSeconds - 1),
    })),

  // ── Selectors ────────────────────────────────────────────────────────
  getAnsweredCount: () => Object.keys(get().answers).length,

  getUnansweredCount: () => get().questions.length - Object.keys(get().answers).length,

  getMarkedCount: () => Object.keys(get().markedForReview).length,

  getQuestionStatus: (questionId) => {
    const { answers, markedForReview } = get();
    const isAnswered = answers[questionId] !== undefined;
    const isMarked = Boolean(markedForReview[questionId]);

    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  },
}));