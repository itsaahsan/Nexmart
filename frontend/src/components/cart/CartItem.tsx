import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '../../types/cart'
import { formatPrice } from '../../utils/formatPrice'

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export default function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-xl bg-white">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-24 h-24 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%23e5e7eb"><rect width="96" height="96" rx="8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af">No Image</text></svg>')
          e.currentTarget.className = 'w-24 h-24 rounded-lg object-contain bg-gray-100'
        }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-text-primary">{item.name}</h3>
        <p className="text-lg font-bold text-orange-500 mt-1">{formatPrice(item.price)}</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.product_id, Math.min(item.quantity + 1, item.stock))}
            disabled={item.quantity >= item.stock}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onRemove(item.product_id)}
            className="ml-auto p-2 text-text-secondary hover:text-error transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
