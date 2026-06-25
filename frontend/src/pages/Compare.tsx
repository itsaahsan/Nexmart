import { Link } from 'react-router-dom'
import { X, ShoppingCart } from 'lucide-react'
import { useCompareStore } from '../store/compareStore'
import { useCartStore } from '../store/cartStore'
import { formatPrice } from '../utils/formatPrice'
import Rating from '../components/ui/Rating'
import toast from 'react-hot-toast'

export default function Compare() {
  const { items, removeItem, clearAll } = useCompareStore()
  const { addItem } = useCartStore()

  const handleAddToCart = (product: typeof items[0]) => {
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

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Product Comparison</h1>
        <p className="text-text-secondary mb-8">No products to compare. Add products from the shop.</p>
        <Link to="/products" className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  const attributes = [
    { label: 'Brand', key: 'brand' as const },
    { label: 'Category', key: 'category' as const },
    { label: 'SKU', key: 'sku' as const },
    { label: 'Stock', key: 'stock' as const },
    { label: 'Rating', key: 'rating' as const },
    { label: 'Reviews', key: 'review_count' as const },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Compare Products ({items.length})</h1>
        <button onClick={clearAll} className="text-sm text-error hover:underline">Clear All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-4 w-40"></th>
              {items.map((product) => (
                <th key={product.id} className="p-4 text-center">
                  <div className="relative">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 z-10"
                    >
                      <X size={14} />
                    </button>
                    <Link to={`/products/${product.id}`}>
                      <img src={product.image_url} alt={product.name} className="w-32 h-32 object-cover rounded-xl mx-auto mb-3" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="#e5e7eb"><rect width="128" height="128" rx="12"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>') }} />
                      <h3 className="text-sm font-medium line-clamp-2 hover:text-accent">{product.name}</h3>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="p-4 font-medium text-text-secondary">Price</td>
              {items.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <span className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="block text-sm text-text-secondary line-through">{formatPrice(product.compare_price)}</span>
                  )}
                </td>
              ))}
            </tr>
            {attributes.map((attr) => (
              <tr key={attr.key} className="border-t border-border">
                <td className="p-4 font-medium text-text-secondary">{attr.label}</td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm">
                    {attr.key === 'rating' ? (
                      <Rating value={product.rating} count={product.review_count} size="sm" />
                    ) : (
                      String(product[attr.key] ?? '-')
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-4 font-medium text-text-secondary">Action</td>
              {items.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {items.length < 4 && (
        <div className="mt-8 text-center">
          <Link to="/products" className="text-accent hover:underline text-sm">
            + Add more products to compare
          </Link>
        </div>
      )}
    </div>
  )
}
