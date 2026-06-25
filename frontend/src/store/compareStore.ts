import { create } from 'zustand'
import type { Product } from '../types/product'

interface CompareState {
  items: Product[]
  addItem: (product: Product) => boolean
  removeItem: (productId: string) => void
  clearAll: () => void
  isInCompare: (productId: string) => boolean
}

const MAX_COMPARE = 4

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const state = get()
    if (state.items.length >= MAX_COMPARE) {
      return false
    }
    if (state.items.find((p) => p.id === product.id)) {
      return false
    }
    set({ items: [...state.items, product] })
    return true
  },
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((p) => p.id !== productId),
    })),
  clearAll: () => set({ items: [] }),
  isInCompare: (productId) => get().items.some((p) => p.id === productId),
}))
