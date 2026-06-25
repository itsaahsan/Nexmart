export interface CartItem {
  product_id: string
  name: string
  price: number
  image_url: string
  quantity: number
  stock: number
}

export interface Cart {
  items: CartItem[]
  total: number
  item_count: number
}

export interface WishlistItem {
  id: string
  product_id: string
  created_at: string
  product: {
    id: string
    name: string
    price: number
    image_url: string
    slug: string
  }
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  body: string
  user_name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  created_at: string
}

export interface DashboardStats {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  recent_orders: {
    id: string
    total: number
    status: string
    user_name: string
    created_at: string
  }[]
  top_products: {
    id: string
    name: string
    rating: number
    review_count: number
    price: number
  }[]
}
