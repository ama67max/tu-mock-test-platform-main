import axiosInstance from './axiosConfig';

const normalizeError = (err, fallbackMessage) => {
  const message = err?.response?.data?.message || err?.message || fallbackMessage;
  const error = new Error(message);
  error.payload = err?.response?.data;
  throw error;
};

export const getSystemAnalytics = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/analytics/system', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch system analytics');
  }
};

export const getCategoryBreakdown = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/analytics/categories', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch category breakdown');
  }
};

export const getAttemptTrends = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/analytics/trends', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch attempt trends');
  }
};

export const getMyAttemptTrends = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/analytics/my-trends', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch my attempt trends');
  }
};

export const getMyAnalytics = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/analytics/me', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch my analytics');
  }
};

export const getDashboardStats = getSystemAnalytics;
export const getTrendData = getAttemptTrends;
export const getSubjectBreakdown = getCategoryBreakdown;

export default {
  getSystemAnalytics,
  getCategoryBreakdown,
  getAttemptTrends,
  getMyAttemptTrends,
  getMyAnalytics,
  getDashboardStats,
  getTrendData,
  getSubjectBreakdown,
};
