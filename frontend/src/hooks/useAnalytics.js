/**
 * SWR Hooks for Analytics Data
 * Provides cached, reactive analytics data fetching
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  myAnalyticsFetcher,
  myTrendsFetcher,
  myResultsFetcher,
  systemAnalyticsFetcher,
  categoryBreakdownFetcher,
} from '../utils/fetchers';

// ── SWR Configuration ────────────────────────────────────────────────────────
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 20000, // 20 seconds
  shouldRetryOnError: false,
};

// ── useMyAnalytics Hook ───────────────────────────────────────────────────────

/**
 * Hook to fetch and cache user's personal analytics
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { analytics, isLoading, error, refresh }
 */
export function useMyAnalytics(options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'my-analytics',
    myAnalyticsFetcher,
    {
      ...SWR_CONFIG,
      // Refresh on reconnect since user might have submitted exam
      revalidateOnReconnect: true,
      // Consider data fresh for 1 minute
      staleTime: 60 * 1000,
      ...options,
    }
  );

  return {
    analytics: data || {},
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useMyTrends Hook ───────────────────────────────────────────────────────────

/**
 * Hook to fetch and cache user's attempt trends
 * @param {number} days - Number of days to fetch (default: 30)
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { trends, isLoading, error, refresh }
 */
export function useMyTrends(days = 30, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    `my-trends:${days}`,
    () => myTrendsFetcher(days),
    {
      ...SWR_CONFIG,
      // Trends are historical data - cache longer
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  );

  return {
    trends: data || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useMyResults Hook ──────────────────────────────────────────────────────────

/**
 * Hook to fetch and cache user's exam results
 * @param {Object} params - Query parameters (page, limit)
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { results, isLoading, error, refresh }
 */
export function useMyResults(params = {}, options = {}) {
  const { page = 1, limit = 10 } = params;
  const cacheKey = `my-results:${page}:${limit}`;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => myResultsFetcher(params),
    {
      ...SWR_CONFIG,
      // Results change when new attempts complete
      revalidateOnReconnect: true,
      staleTime: 60 * 1000,
      ...options,
    }
  );

  return {
    results: data?.attempts || [],
    total: data?.total || 0,
    pages: data?.pages || 0,
    currentPage: data?.page || page,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useSystemAnalytics Hook (Admin) ────────────────────────────────────────────

/**
 * Hook to fetch and cache system-wide analytics (admin dashboard)
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { stats, isLoading, error, refresh }
 */
export function useSystemAnalytics(options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    'system-analytics',
    systemAnalyticsFetcher,
    {
      ...SWR_CONFIG,
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  );

  return {
    stats: data || {},
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── useCategoryBreakdown Hook (Admin) ──────────────────────────────────────────

/**
 * Hook to fetch and cache category breakdown (admin dashboard)
 * @param {Object} options - Additional SWR options
 * @returns {Object} - { breakdown, isLoading, error, refresh }
 */
export function useCategoryBreakdown(options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    'category-breakdown',
    categoryBreakdownFetcher,
    {
      ...SWR_CONFIG,
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  );

  return {
    breakdown: data || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

// ── Cache Invalidation Helpers ────────────────────────────────────────────────

/**
 * Mutate/refresh analytics caches
 * Call this after exam submission to refresh user data
 */
export function useAnalyticsMutations() {
  const { mutate } = useSWR();

  const refreshUserAnalytics = () => {
    mutate('my-analytics', undefined, { revalidate: true });
  };

  const refreshUserResults = () => {
    // Invalidate all results pages
    mutate(
      (key) => typeof key === 'string' && key.startsWith('my-results:'),
      undefined,
      { revalidate: true }
    );
  };

  const refreshAllUserData = () => {
    refreshUserAnalytics();
    refreshUserResults();
    // Invalidate all trends
    mutate(
      (key) => typeof key === 'string' && key.startsWith('my-trends:'),
      undefined,
      { revalidate: true }
    );
  };

  const refreshAdminAnalytics = () => {
    mutate('system-analytics', undefined, { revalidate: true });
    mutate('category-breakdown', undefined, { revalidate: true });
  };

  return {
    refreshUserAnalytics,
    refreshUserResults,
    refreshAllUserData,
    refreshAdminAnalytics,
  };
}

export default {
  useMyAnalytics,
  useMyTrends,
  useMyResults,
  useSystemAnalytics,
  useCategoryBreakdown,
  useAnalyticsMutations,
};
