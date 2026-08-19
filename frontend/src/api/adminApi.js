import axiosInstance from './axiosConfig';

const normalizeError = (err, fallback) => {
  const message = err?.response?.data?.message || err?.message || fallback;
  const error = new Error(message);
  error.payload = err?.response?.data;
  throw error;
};

export const getAdminOverview = async () => {
  try {
    const res = await axiosInstance.get('/admin/overview');
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch admin overview');
  }
};

export const getAdminCategories = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/admin/categories', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch categories');
  }
};

export const createAdminCategory = async (payload) => {
  try {
    const res = await axiosInstance.post('/admin/categories', payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to create category');
  }
};

export const updateAdminCategory = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/admin/categories/${id}`, payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to update category');
  }
};

export const deleteAdminCategory = async (id) => {
  try {
    const res = await axiosInstance.delete(`/admin/categories/${id}`);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to delete category');
  }
};

export const getUsers = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/users/search', { params });
    return {
      data: res.data.data?.users || [],
      meta: res.data.data,
    };
  } catch (err) {
    normalizeError(err, 'Failed to fetch users');
  }
};

export const updateUser = async (id, payload) => {
  try {
    if (payload?.toggleActive) {
      const res = await axiosInstance.patch(`/users/${id}/toggle`);
      return res.data;
    }

    const res = await axiosInstance.put(`/users/${id}`, payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to update user');
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to delete user');
  }
};

export const getExams = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/exams', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch exams');
  }
};

export const createExam = async (payload) => {
  try {
    const res = await axiosInstance.post('/exams', payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to create exam');
  }
};

export const updateExam = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/exams/${id}`, payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to update exam');
  }
};

export const deleteExam = async (id) => {
  try {
    const res = await axiosInstance.delete(`/exams/${id}`);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to delete exam');
  }
};

export const uploadQuestion = async (payload) => {
  try {
    const res = await axiosInstance.post('/questions', payload);
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to create question');
  }
};

export const uploadQuestions = async (formData) => {
  try {
    const res = await axiosInstance.post('/questions/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to upload questions');
  }
};

export const getQuestions = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/questions', { params });
    return res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch questions');
  }
};

export const getExamById = async (id) => {
  try {
    const res = await axiosInstance.get(`/exams/${id}`);
    // Normalize ApiResponse wrapper: return inner data if present
    return res.data?.data || res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch exam');
  }
};

export const getExamQuestions = async (id) => {
  try {
    const res = await axiosInstance.get(`/exams/${id}/questions`);
    return res.data?.data || res.data;
  } catch (err) {
    normalizeError(err, 'Failed to fetch exam questions');
  }
};

export const setExamQuestions = async (id, questionIds) => {
  try {
    const res = await axiosInstance.put(`/exams/${id}/questions`, { questionIds });
    return res.data?.data || res.data;
  } catch (err) {
    normalizeError(err, 'Failed to set exam questions');
  }
};

export default {
  getAdminOverview,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getUsers,
  updateUser,
  deleteUser,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  uploadQuestion,
  uploadQuestions,
  getQuestions,
  getExamById,
  getExamQuestions,
  setExamQuestions,
};
