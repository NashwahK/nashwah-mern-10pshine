import apiClient from './apiClient';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const notesAPI = {
  createNote: (data) => apiClient.post('/notes', data),
  getNotes: (page = 1, limit = 10, search = '') =>
    apiClient.get('/notes', { params: { page, limit, search } }),
  getNoteById: (id) => apiClient.get(`/notes/${id}`),
  updateNote: (id, data) => apiClient.put(`/notes/${id}`, data),
  deleteNote: (id) => apiClient.delete(`/notes/${id}`),
};
