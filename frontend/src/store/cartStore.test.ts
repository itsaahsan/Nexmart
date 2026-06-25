import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cartStore'
import type { CartItem } from '../types/cart'

const mockItem: CartItem = {
  product_id: '1',
  name: 'Test Product',
  price: 29.99,
  image_url: 'https://example.com/img.jpg',
  quantity: 1,
  stock: 10,
}

const mockItem2: CartItem = {
  product_id: '2',
  name: 'Test Product 2',
  price: 49.99,
  image_url: 'https://example.com/img2.jpg',
  quantity: 2,
  stock: 5,
}

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ cart: { items: [], total: 0, item_count: 0 }, isOpen: false })
})

describe('cartStore', () => {
  it('starts with empty cart', () => {
    const { cart } = useCartStore.getState()
    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
    expect(cart.item_count).toBe(0)
  })

  it('adds new item', () => {
    useCartStore.getState().addItem(mockItem)
    const { cart } = useCartStore.getState()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].product_id).toBe('1')
    expect(cart.total).toBe(29.99)
    expect(cart.item_count).toBe(1)
  })

  it('increases quantity for existing item', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem({ ...mockItem, quantity: 2 })
    const { cart } = useCartStore.getState()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(3)
    expect(cart.item_count).toBe(3)
  })

  it('removes item by product_id', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItem2)
    useCartStore.getState().removeItem('1')
    const { cart } = useCartStore.getState()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].product_id).toBe('2')
  })

  it('updates item quantity', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().updateItem('1', 5)
    const { cart } = useCartStore.getState()
    expect(cart.items[0].quantity).toBe(5)
    expect(cart.item_count).toBe(5)
    expect(cart.total).toBeCloseTo(149.95, 2)
  })

  it('clears entire cart', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItem2)
    useCartStore.getState().clearCart()
    const { cart } = useCartStore.getState()
    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
    expect(cart.item_count).toBe(0)
  })

  it('calculates correct total with multiple items', () => {
    useCartStore.getState().addItem(mockItem)
    useCartStore.getState().addItem(mockItem2)
    const { cart } = useCartStore.getState()
    expect(cart.total).toBeCloseTo(129.97, 2)
    expect(cart.item_count).toBe(3)
  })

  it('rounds total to 2 decimal places', () => {
    useCartStore.getState().addItem({ ...mockItem, price: 9.99, quantity: 3 })
    const { cart } = useCartStore.getState()
    expect(cart.total).toBe(29.97)
  })

  it('toggles cart open/closed', () => {
    expect(useCartStore.getState().isOpen).toBe(false)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(true)
    useCartStore.getState().toggleCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })

  it('persists to localStorage', () => {
    useCartStore.getState().addItem(mockItem)
    const stored = JSON.parse(localStorage.getItem('guest_cart') || '{}')
    expect(stored.items).toHaveLength(1)
    expect(stored.items[0].product_id).toBe('1')
  })
})
