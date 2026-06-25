import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, Heart, ShoppingBag, ChevronRight, BarChart3 } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { useCartStore } from '../store/cartStore'
import { useCompareStore } from '../store/compareStore'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/formatPrice'
import { recentlyViewed } from '../utils/recentlyViewed'
import Button from '../components/ui/Button'
import Rating from '../components/ui/Rating'
import ProductImages from '../components/product/ProductImages'
import ProductReviews from '../components/product/ProductReviews'
import RelatedProducts from '../components/product/RelatedProducts'
import RecentlyViewed from '../components/product/RecentlyViewed'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id || '')
  const { addItem } = useCartStore()
  const { addItem: addToCompare, isInCompare } = useCompareStore()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: wishlistCheck } = useQuery({
    queryKey: ['wishlist', 'check', id],
    queryFn: async () => {
      const res = await api.get(`/api/wishlist/check/${id}`)
      return res.data
    },
    enabled: !!id && isAuthenticated,
  })

  useEffect(() => {
    if (wishlistCheck) {
      setIsInWishlist(wishlistCheck.in_wishlist)
    }
  }, [wishlistCheck])

  useEffect(() => {
    if (product) {
      recentlyViewed.add(product)
    }
  }, [product])

  const handleCompare = () => {
    if (!product) return
    const added = addToCompare(product)
    if (added === false) {
      if (isInCompare(product.id)) {
        toast.error('Already in comparison')
      } else {
        toast.error('Max 4 products can be compared')
      }
    } else {
      toast.success('Added to comparison')
    }
  }

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      if (isInWishlist) {
        await api.delete(`/api/wishlist/${id}`)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/api/wishlist/${id}`)
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <Link to="/products" className="text-accent hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-accent">Products</Link>
        <ChevronRight size={14} />
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <ProductImages image_url={product.image_url} images={product.images} />

        <div className="space-y-6">
          <div>
            <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-3"><Rating value={product.rating} count={product.review_count} /></div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-500">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-text-secondary line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>

          <p className="text-text-secondary leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors"><Minus size={18} /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-50 transition-colors"><Plus size={18} /></button>
              </div>
              <Button
                onClick={() => {
                  addItem({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    quantity,
                    stock: product.stock,
                  })
                  toast.success('Added to cart')
                }}
                size="lg"
                className="flex-1 gap-2"
              >
                <ShoppingBag size={18} /> Add to Cart
              </Button>
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-lg border transition-colors ${isInWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'border-border hover:bg-gray-50'}`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleCompare}
                className={`p-3 rounded-lg border transition-colors ${isInCompare(product.id) ? 'bg-accent/10 border-accent text-accent' : 'border-border hover:bg-gray-50'}`}
                title="Compare"
              >
                <BarChart3 size={20} />
              </button>
            </div>
          )}

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between text-sm"><span className="text-text-secondary">Category</span><span className="font-medium">{product.category}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-secondary">SKU</span><span className="font-medium">{product.sku}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <ProductReviews reviews={reviews} productId={product.id} />
      </div>

      <div className="mt-16">
        <RelatedProducts category={product.category} currentId={product.id} />
      </div>

      <RecentlyViewed />
    </div>
  )
}
