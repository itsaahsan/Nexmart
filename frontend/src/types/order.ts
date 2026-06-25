export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product_name: string
  product_image: string
}

export interface Order {
  id: string
  total_amount: number
  subtotal: number
  shipping: number
  tax: number
  status: OrderStatus
  stripe_payment_id?: string
  shipping_address?: Record<string, string>
  items: OrderItem[]
  created_at: string
}

export interface OrderListResponse {
  orders: Order[]
  total: number
  page: number
  pages: number
}
