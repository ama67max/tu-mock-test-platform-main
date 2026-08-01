import axiosInstance from './axiosConfig';

export const startAttempt = (payload) =>
  axiosInstance.post('/attempts/start', payload);

export const submitAnswer = (payload) =>
  axiosInstance.post('/attempts/submit-answer', payload);

export const finishAttempt = (payload) =>
  axiosInstance.post('/attempts/finish', payload);

export const getAttemptById = (id) => axiosInstance.get(`/attempts/${id}`);
