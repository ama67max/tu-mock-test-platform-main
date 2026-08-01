import axiosInstance from './axiosConfig';

export const getExams = (params = {}) => axiosInstance.get('/exams', { params });

export const getExamById = (id) => axiosInstance.get(`/exams/${id}`);
