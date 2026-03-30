import apiClient from './client'

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data).then((r) => r.data),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }).then((r) => {
      localStorage.setItem('access_token', r.data.access_token)
      localStorage.setItem('refresh_token', r.data.refresh_token)
      return r.data
    }),

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  isAuthenticated: () => !!localStorage.getItem('access_token'),
}
