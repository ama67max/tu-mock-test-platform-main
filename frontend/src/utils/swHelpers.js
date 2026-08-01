export const SW_MESSAGE_TYPE = {
  PREFETCH_EXAM: 'PREFETCH_EXAM',
};

const RECENT_EXAMS_KEY = 'recentlyAccessedExams';
const MAX_RECENT_EXAMS = 5;

export function addExamToLocalStorageCache(examId) {
  if (!examId || typeof window === 'undefined' || !window.localStorage) return [];

  try {
    const raw = window.localStorage.getItem(RECENT_EXAMS_KEY) || '[]';
    const recent = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const deduped = [examId, ...recent.filter((id) => id !== examId)];
    const trimmed = deduped.slice(0, MAX_RECENT_EXAMS);
    window.localStorage.setItem(RECENT_EXAMS_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (error) {
    console.warn('Unable to update recent exams localStorage cache:', error);
    return [];
  }
}

export async function sendMessageToServiceWorker(message) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const controller = navigator.serviceWorker.controller;
  if (controller) {
    controller.postMessage(message);
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage(message);
  } catch (error) {
    console.warn('Service worker is not ready to receive messages:', error);
  }
}
