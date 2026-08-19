/**
 * SWR Fetcher Utilities
 * Centralized fetcher functions for SWR data fetching
 */

import { getExams, getExamById } from '../api/examApi';
import analyticsApi from '../api/analyticsApi';
import resultApi from '../api/resultApi';

// ── Exam Fetchers ─────────────────────────────────────────────────────────────

/**
 * Fetch exams list for SWR
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - Array of exams
 */
export const examsFetcher = async (params) => {
  try {
    const res = await getExams(params);
    const payload = res?.data?.data || res?.data || res;
    
    // Handle different response structures
    if (Array.isArray(payload?.exams)) {
      return payload.exams;
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    return [];
  } catch (error) {
    console.error('[SWR] examsFetcher error:', error);
    throw error;
  }
};

/**
 * Fetch single exam detail for SWR
 * @param {string|number} examId - Exam ID
 * @returns {Promise<Object>} - Exam object
 */
export const examDetailFetcher = async (examId) => {
  if (!examId) return null;
  
  try {
    const res = await getExamById(examId);
    return res?.data?.data || res?.data || null;
  } catch (error) {
    console.error('[SWR] examDetailFetcher error:', error);
    throw error;
  }
};

// ── Analytics Fetchers ────────────────────────────────────────────────────────

/**
 * Fetch user's personal analytics for SWR
 * @returns {Promise<Object>} - Analytics data
 */
export const myAnalyticsFetcher = async () => {
  try {
    const res = await analyticsApi.getMyAnalytics();
    return res?.data || {};
  } catch (error) {
    console.error('[SWR] myAnalyticsFetcher error:', error);
    throw error;
  }
};

/**
 * Fetch user's attempt trends for SWR
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} - Trend data array
 */
export const myTrendsFetcher = async (days = 30) => {
  try {
    const res = await analyticsApi.getMyAttemptTrends({ days });
    
    // Normalize trend data structure
    const data = res?.data || [];
    return data.map((item) => ({
      date: item.date,
      avgScore: item.average_score ?? item.avgScore ?? 0,
      attempts: item.attempts ?? 0,
    }));
  } catch (error) {
    console.error('[SWR] myTrendsFetcher error:', error);
    throw error;
  }
};

/**
 * Fetch system analytics for admin dashboard (SWR)
 * @returns {Promise<Object>} - System stats
 */
export const systemAnalyticsFetcher = async () => {
  try {
    const res = await analyticsApi.getSystemAnalytics();
    return res?.data || {};
  } catch (error) {
    console.error('[SWR] systemAnalyticsFetcher error:', error);
    throw error;
  }
};

/**
 * Fetch category breakdown for admin dashboard (SWR)
 * @returns {Promise<Array>} - Category breakdown data
 */
export const categoryBreakdownFetcher = async () => {
  try {
    const res = await analyticsApi.getCategoryBreakdown();
    return res?.data || [];
  } catch (error) {
    console.error('[SWR] categoryBreakdownFetcher error:', error);
    throw error;
  }
};

// ── Results Fetchers ──────────────────────────────────────────────────────────

/**
 * Fetch user's results for SWR
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} - Results with pagination
 */
export const myResultsFetcher = async (params = {}) => {
  try {
    const res = await resultApi.getResults(params);
    return res?.data || { attempts: [], total: 0, page: 1, pages: 0 };
  } catch (error) {
    console.error('[SWR] myResultsFetcher error:', error);
    throw error;
  }
};

/**
 * Fetch single result detail for SWR
 * @param {string|number} attemptId - Attempt ID
 * @returns {Promise<Object>} - Result detail
 */
export const resultDetailFetcher = async (attemptId) => {
  if (!attemptId) return null;
  
  try {
    const res = await resultApi.getResult(attemptId);
    return res?.data || null;
  } catch (error) {
    console.error('[SWR] resultDetailFetcher error:', error);
    throw error;
  }
};

// ── Generic Fetcher ───────────────────────────────────────────────────────────

/**
 * Generic fetcher that wraps any async function
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - SWR-compatible fetcher
 */
export const createFetcher = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error('[SWR] createFetcher error:', error);
    throw error;
  }
};

export default {
  examsFetcher,
  examDetailFetcher,
  myAnalyticsFetcher,
  myTrendsFetcher,
  systemAnalyticsFetcher,
  categoryBreakdownFetcher,
  myResultsFetcher,
  resultDetailFetcher,
  createFetcher,
};
