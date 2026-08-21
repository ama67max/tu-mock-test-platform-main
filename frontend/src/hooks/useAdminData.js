import useSWR from 'swr';
import * as adminApi from '../api/adminApi';
import * as analyticsApi from '../api/analyticsApi';
import SWR_CONFIG from './swrConfig';

export function useAdminDashboardData() {
  const { data, error, isLoading, mutate } = useSWR(
    'admin-dashboard',
    async () => {
      const [stats, users] = await Promise.all([
        analyticsApi.getDashboardStats(),
        adminApi.getUsers({ page: 1, limit: 6 }),
      ]);

      return {
        stats: stats?.data || {},
        users: users?.data || [],
      };
    },
    SWR_CONFIG
  );

  return {
    stats: data?.stats || {},
    users: data?.users || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAdminUsersData() {
  const { data, error, isLoading, mutate } = useSWR(
    'admin-users:1:50',
    async () => {
      const response = await adminApi.getUsers({ page: 1, limit: 50 });
      return response?.data || [];
    },
    SWR_CONFIG
  );

  return {
    users: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAdminAnalyticsDefaults() {
  const { data, error, isLoading, mutate } = useSWR(
    'admin-analytics-defaults',
    analyticsApi.getDashboardStats,
    SWR_CONFIG
  );

  return {
    stats: data?.data || {},
    isLoading,
    error,
    refresh: mutate,
  };
}