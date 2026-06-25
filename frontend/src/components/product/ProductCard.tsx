import { Link } from 'react-router-dom'
import { ShoppingBag, BarChart3 } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatPrice } from '../../utils/formatPrice'
import Rating from '../ui/Rating'
import { useCartStore } from '../../store/cartStore'
import { useCompareStore } from '../../store/compareStore'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { addItem: addToCompare, isInCompare } = useCompareStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      stock: product.stock,
    })
    toast.success('Added to cart')
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-border bg-white overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23e5e7eb"><rect width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af">No Image</text></svg>')
              e.currentTarget.className = 'w-full h-full object-contain bg-gray-100'
            }}
          />
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-3 left-3 bg-error text-white text-xs font-medium px-2 py-1 rounded-full">
              -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
            </span>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCompare}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
              title="Compare"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <Rating value={product.rating} count={product.review_count} size="sm" />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-text-secondary line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
