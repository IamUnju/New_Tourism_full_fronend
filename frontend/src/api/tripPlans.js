import apiClient from './client'

export const tripPlansApi = {
  create: (data) =>
    apiClient.post('/trip-plans', data).then((r) => r.data),

  myPlans: (params = {}) =>
    apiClient.get('/trip-plans/me', { params }).then((r) => r.data),

  all: (params = {}) =>
    apiClient.get('/trip-plans', { params }).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/trip-plans/${id}`, data).then((r) => r.data),
}
