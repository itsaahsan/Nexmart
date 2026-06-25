import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Trash2, Heart } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import toast from 'react-hot-toast'
import type { WishlistItem } from '../types/cart'

export default function Wishlist() {
  const queryClient = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/api/wishlist')
      return res.data as WishlistItem[]
    },
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/api/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Removed from wishlist')
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <Link to={`/products/${item.product_id}`}>
                <img src={item.product.image_url} alt={item.product.name} className="w-full aspect-square object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="#e5e7eb"><rect width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">No Image</text></svg>') }} />
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.product_id}`} className="text-sm font-medium hover:text-accent line-clamp-2">{item.product.name}</Link>
                <p className="text-lg font-bold text-orange-500 mt-1">{formatPrice(item.product.price)}</p>
                <button onClick={() => removeMutation.mutate(item.product_id)} className="mt-2 flex items-center gap-1 text-sm text-text-secondary hover:text-error transition-colors">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary">Your wishlist is empty</p>
          <Link to="/products" className="text-accent hover:underline mt-4 inline-block">Start Shopping</Link>
        </div>
      )}
    </div>
  )
}
