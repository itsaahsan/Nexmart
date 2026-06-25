import api from './axios'
import type { Order, OrderListResponse } from '../types/order'
import type { CartItem } from '../types/cart'

export const ordersApi = {
  list: async (page: number = 1, status?: string): Promise<OrderListResponse> => {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.append('status_filter', status)
    const response = await api.get(`/api/orders?${params.toString()}`)
    return response.data
  },

  get: async (id: string): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data
  },

  createPaymentIntent: async (items: CartItem[]): Promise<{ client_secret: string; amount: number }> => {
    const response = await api.post('/api/orders/create-payment-intent', {
      shipping_address: {},
      items: items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        quantity: i.quantity,
      })),
    })
    return response.data
  },

  create: async (shippingAddress: Record<string, string>, _paymentIntentId: string, items: CartItem[]): Promise<Order> => {
    const response = await api.post('/api/orders', {
      shipping_address: shippingAddress,
      items: items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        quantity: i.quantity,
      })),
    })
    return response.data
  },
}
