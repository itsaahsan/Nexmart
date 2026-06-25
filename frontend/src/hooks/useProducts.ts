import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/products'
import type { ProductFilters } from '../types/product'

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  })
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: productsApi.getFeatured,
  })
}

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['products', 'suggestions', query],
    queryFn: () => productsApi.searchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 60000,
  })
}
