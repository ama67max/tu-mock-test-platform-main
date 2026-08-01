import axiosInstance from './axiosConfig';

export const register = (payload) => axiosInstance.post('/auth/register', payload);

export const login = (payload) => axiosInstance.post('/auth/login', payload);

export const logout = () => axiosInstance.post('/auth/logout');