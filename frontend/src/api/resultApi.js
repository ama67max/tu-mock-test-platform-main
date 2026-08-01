import axiosInstance from './axiosConfig';

/**
 * Fetch paginated results.
 * @param {{page?: number, limit?: number, examId?: number, userId?: number, sort?: string}} params
 * @returns {Promise<{data: any, meta: {total:number,page:number,limit:number}}>} response.data
 */
export async function getResults(params = {}) {
  try {
    const res = await axiosInstance.get('/results', { params });
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch results';
    const error = new Error(message);
    error.payload = err?.response?.data;
    throw error;
  }
}

/**
 * Fetch a single result by attempt ID
 * @param {number|string} attemptId
 */
export async function getResult(attemptId) {
  if (!attemptId) throw new Error('attemptId is required');
  try {
    const res = await axiosInstance.get(`/results/${attemptId}`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch result';
    const error = new Error(message);
    error.payload = err?.response?.data;
    throw error;
  }
}

/**
 * Fetch answers for an attempt (for review)
 * @param {number|string} attemptId
 */
export async function getAttemptAnswers(attemptId) {
  if (!attemptId) throw new Error('attemptId is required');
  try {
    const res = await axiosInstance.get(`/results/${attemptId}/answers`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to fetch attempt answers';
    const error = new Error(message);
    error.payload = err?.response?.data;
    throw error;
  }
}

/**
 * Request a CSV export for results (admin)
 * Returns a Blob which callers can download
 * @param {{examId: number, format?: string}} options
 */
export async function exportResultsCSV(options = {}) {
  try {
    const res = await axiosInstance.get('/admin/results/export', {
      params: options,
      responseType: 'blob',
    });
    return res.data; // Blob
  } catch (err) {
    const message = err?.response?.data?.message || err.message || 'Failed to export results';
    const error = new Error(message);
    error.payload = err?.response?.data;
    throw error;
  }
}

export default { getResults, getResult, getAttemptAnswers, exportResultsCSV };

export const getMyResults = (params = {}) => axiosInstance.get('/results', { params });

export const getResultByAttemptId = (attemptId) => axiosInstance.get(`/results/${attemptId}`);
