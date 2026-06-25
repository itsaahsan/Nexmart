import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recentlyViewed } from '../../utils/recentlyViewed'
import { formatPrice } from '../../utils/formatPrice'
import type { Product } from '../../types/product'

export default function RecentlyViewed() {
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    setItems(recentlyViewed.get())
  }, [])

  if (items.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-xl font-bold tracking-tight mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group block rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-all"
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="#e5e7eb"><rect width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>') }}
              />
            </div>
            <div className="p-3">
              <h3 className="text-xs font-medium line-clamp-2 mb-1 group-hover:text-accent">{product.name}</h3>
              <span className="text-sm font-bold text-orange-500">{formatPrice(product.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
