export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price: number | null
  category: string
  brand: string
  image_url: string
  images: string[]
  stock: number
  sku: string
  is_featured: boolean
  is_active: boolean
  rating: number
  review_count: number
  category_id?: string
  created_at: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export interface ProductFilters {
  category?: string
  brand?: string
  search?: string
  min_price?: number
  max_price?: number
  sort?: string
  in_stock?: boolean
  featured?: boolean
  page?: number
  limit?: number
}
