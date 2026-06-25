import { describe, it, expect, beforeEach } from 'vitest'
import { useCompareStore } from './compareStore'
import type { Product } from '../types/product'

const mockProduct = (id: string, name = 'Product'): Product => ({
  id,
  name,
  slug: `product-${id}`,
  description: 'Desc',
  price: 10,
  compare_price: null,
  category: 'Test',
  brand: 'Brand',
  image_url: `https://example.com/${id}.jpg`,
  images: [],
  stock: 10,
  sku: `SKU-${id}`,
  is_featured: false,
  is_active: true,
  rating: 4.0,
  review_count: 10,
  created_at: '2024-01-01T00:00:00Z',
})

beforeEach(() => {
  useCompareStore.setState({ items: [] })
})

describe('compareStore', () => {
  it('starts empty', () => {
    expect(useCompareStore.getState().items).toEqual([])
  })

  it('adds item and returns true', () => {
    const result = useCompareStore.getState().addItem(mockProduct('1'))
    expect(result).toBe(true)
    expect(useCompareStore.getState().items).toHaveLength(1)
  })

  it('rejects duplicate items', () => {
    useCompareStore.getState().addItem(mockProduct('1'))
    const result = useCompareStore.getState().addItem(mockProduct('1'))
    expect(result).toBe(false)
    expect(useCompareStore.getState().items).toHaveLength(1)
  })

  it('rejects when at max (4 items)', () => {
    for (let i = 1; i <= 4; i++) {
      useCompareStore.getState().addItem(mockProduct(String(i)))
    }
    const result = useCompareStore.getState().addItem(mockProduct('5'))
    expect(result).toBe(false)
    expect(useCompareStore.getState().items).toHaveLength(4)
  })

  it('removes item by id', () => {
    useCompareStore.getState().addItem(mockProduct('1'))
    useCompareStore.getState().addItem(mockProduct('2'))
    useCompareStore.getState().removeItem('1')
    expect(useCompareStore.getState().items).toHaveLength(1)
    expect(useCompareStore.getState().items[0].id).toBe('2')
  })

  it('isInCheck works', () => {
    useCompareStore.getState().addItem(mockProduct('1'))
    expect(useCompareStore.getState().isInCompare('1')).toBe(true)
    expect(useCompareStore.getState().isInCompare('999')).toBe(false)
  })

  it('clearAll empties the store', () => {
    useCompareStore.getState().addItem(mockProduct('1'))
    useCompareStore.getState().addItem(mockProduct('2'))
    useCompareStore.getState().clearAll()
    expect(useCompareStore.getState().items).toEqual([])
  })
})
