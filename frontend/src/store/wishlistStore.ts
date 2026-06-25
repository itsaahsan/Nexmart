import { create } from 'zustand'
import type { WishlistItem } from '../types/cart'

interface WishlistState {
  items: WishlistItem[]
  setItems: (items: WishlistItem[]) => void
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== productId),
    })),
}))
