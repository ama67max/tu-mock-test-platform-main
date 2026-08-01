import axiosInstance from './axiosConfig';

export const getQuestions = (params = {}) =>
  axiosInstance.get('/questions', { params });

export const getQuestionById = (id) => axiosInstance.get(`/questions/${id}`);

export const createQuestion = (payload) =>
  axiosInstance.post('/questions', payload);

export const updateQuestion = (id, payload) =>
  axiosInstance.put(`/questions/${id}`, payload);

export const deleteQuestion = (id) => axiosInstance.delete(`/questions/${id}`);

export const toggleQuestionStatus = (id) =>
  axiosInstance.patch(`/questions/${id}/toggle`);

export const bulkUploadQuestions = (formData) =>
  axiosInstance.post('/questions/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
