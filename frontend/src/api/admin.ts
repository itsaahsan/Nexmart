import api from './axios'
import type { DashboardStats } from '../types/cart'

export const adminApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/admin/dashboard')
    return response.data
  },

  getUsers: async (page: number = 1) => {
    const response = await api.get(`/api/admin/users?page=${page}`)
    return response.data
  },

  updateUser: async (userId: string, data: { is_admin?: boolean; is_verified?: boolean }) => {
    const response = await api.put(`/api/admin/users/${userId}`, data)
    return response.data
  },

  getOrders: async (page: number = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.append('status_filter', status)
    const response = await api.get(`/api/admin/orders?${params.toString()}`)
    return response.data
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/api/admin/orders/${orderId}/status`, { status })
    return response.data
  },

  getProducts: async (page: number = 1) => {
    const response = await api.get(`/api/admin/products?page=${page}`)
    return response.data
  },
}
