import apiClient from './client'

export const inquiriesApi = {
  create: (data) =>
    apiClient.post('/inquiries', data).then((r) => r.data),

  all: (params = {}) =>
    apiClient.get('/inquiries', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/inquiries/${id}`).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/inquiries/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/inquiries/${id}`),
}
