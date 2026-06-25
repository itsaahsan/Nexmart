import { create } from 'zustand'
import type { Cart, CartItem } from '../types/cart'

interface CartState {
  cart: Cart
  isOpen: boolean
  setCart: (cart: Cart) => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateItem: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
}

const getGuestCart = (): Cart => {
  if (typeof window === 'undefined') return { items: [], total: 0, item_count: 0 }
  try {
    const data = localStorage.getItem('guest_cart')
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return { items: [], total: 0, item_count: 0 }
}

const saveGuestCart = (cart: Cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guest_cart', JSON.stringify(cart))
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: getGuestCart(),
  isOpen: false,
  setCart: (cart) => set({ cart }),
  addItem: (item) => {
    const state = get()
    const existing = state.cart.items.find((i) => i.product_id === item.product_id)
    let items: CartItem[]
    if (existing) {
      items = state.cart.items.map((i) =>
        i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    } else {
      items = [...state.cart.items, item]
    }
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const item_count = items.reduce((sum, i) => sum + i.quantity, 0)
    const newCart = { items, total: Math.round(total * 100) / 100, item_count }
    set({ cart: newCart })
    saveGuestCart(newCart)
  },
  removeItem: (productId) => {
    const state = get()
    const items = state.cart.items.filter((i) => i.product_id !== productId)
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const item_count = items.reduce((sum, i) => sum + i.quantity, 0)
    const newCart = { items, total: Math.round(total * 100) / 100, item_count }
    set({ cart: newCart })
    saveGuestCart(newCart)
  },
  updateItem: (productId, quantity) => {
    const state = get()
    const items = state.cart.items.map((i) =>
      i.product_id === productId ? { ...i, quantity } : i
    )
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const item_count = items.reduce((sum, i) => sum + i.quantity, 0)
    const newCart = { items, total: Math.round(total * 100) / 100, item_count }
    set({ cart: newCart })
    saveGuestCart(newCart)
  },
  clearCart: () => {
    set({ cart: { items: [], total: 0, item_count: 0 } })
    saveGuestCart({ items: [], total: 0, item_count: 0 })
  },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
}))
