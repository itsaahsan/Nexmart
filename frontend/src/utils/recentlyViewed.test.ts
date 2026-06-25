import { describe, it, expect, beforeEach } from 'vitest'
import { recentlyViewed } from './recentlyViewed'
import type { Product } from '../types/product'

const mockProduct = (id: string): Product => ({
  id,
  name: `Product ${id}`,
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
  localStorage.clear()
})

describe('recentlyViewed', () => {
  it('returns empty array when nothing stored', () => {
    expect(recentlyViewed.get()).toEqual([])
  })

  it('adds a product', () => {
    recentlyViewed.add(mockProduct('1'))
    const items = recentlyViewed.get()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('1')
  })

  it('moves existing product to front', () => {
    recentlyViewed.add(mockProduct('1'))
    recentlyViewed.add(mockProduct('2'))
    recentlyViewed.add(mockProduct('1'))
    const items = recentlyViewed.get()
    expect(items[0].id).toBe('1')
    expect(items[1].id).toBe('2')
  })

  it('caps at 10 items', () => {
    for (let i = 1; i <= 15; i++) {
      recentlyViewed.add(mockProduct(String(i)))
    }
    expect(recentlyViewed.get()).toHaveLength(10)
    expect(recentlyViewed.get()[0].id).toBe('15')
  })

  it('clears all items', () => {
    recentlyViewed.add(mockProduct('1'))
    recentlyViewed.clear()
    expect(recentlyViewed.get()).toEqual([])
  })
})
