import type { Product } from '../types/product'

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 10

export const recentlyViewed = {
  get(): Product[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  add(product: Product) {
    if (typeof window === 'undefined') return
    const items = this.get().filter((p) => p.id !== product.id)
    items.unshift(product)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  },

  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },
}
