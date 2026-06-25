import api from './axios'
import type { User, AuthTokens } from '../types/user'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthTokens> => {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthTokens> => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  updateMe: async (data: { full_name?: string; phone?: string }): Promise<User> => {
    const params = new URLSearchParams()
    if (data.full_name) params.append('full_name', data.full_name)
    if (data.phone) params.append('phone', data.phone)
    const response = await api.put(`/api/auth/me?${params.toString()}`)
    return response.data
  },

  changePassword: async (data: { current_password: string; new_password: string }) => {
    const response = await api.post('/api/auth/change-password', data)
    return response.data
  },
}
