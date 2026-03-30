import apiClient from './client'

export const adminApi = {
  stats: () =>
    apiClient.get('/admin/dashboard').then((r) => r.data),
}
