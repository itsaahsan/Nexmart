import api from './axios'
import type { Product, ProductListResponse, ProductFilters } from '../types/product'

export const productsApi = {
  list: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
    const response = await api.get(`/api/products?${params.toString()}`)
    return response.data
  },

  get: async (id: string): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`)
    return response.data
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get('/api/products/featured')
    return response.data
  },

  searchSuggestions: async (q: string): Promise<string[]> => {
    const response = await api.get(`/api/products/search-suggestions?q=${q}`)
    return response.data
  },
}
