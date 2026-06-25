import api from './axios'
import type { Cart } from '../types/cart'

export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await api.get('/api/cart')
    return response.data
  },

  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    const response = await api.post('/api/cart/add', { product_id: productId, quantity })
    return response.data
  },

  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.put(`/api/cart/${productId}`, { quantity })
    return response.data
  },

  removeItem: async (productId: string) => {
    const response = await api.delete(`/api/cart/${productId}`)
    return response.data
  },

  clear: async () => {
    const response = await api.delete('/api/cart')
    return response.data
  },

  merge: async (items: { product_id: string; quantity: number }[]) => {
    const response = await api.post('/api/cart/merge', items)
    return response.data
  },
}
