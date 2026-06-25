import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatPrice'
import Button from '../ui/Button'

export default function CartDrawer() {
  const { cart, isOpen, setCartOpen, updateItem, removeItem } = useCartStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-10 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-semibold">Cart ({cart.item_count})</h2>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-text-secondary">Your cart is empty</p>
              <Link to="/products" onClick={() => setCartOpen(false)}>
                <Button className="mt-4" size="sm">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex gap-4 p-3 border border-border rounded-xl">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"><rect width="80" height="80" rx="8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%239ca3af">No Image</text></svg>')
                      e.currentTarget.className = 'w-20 h-20 rounded-lg object-contain bg-gray-100'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">{item.name}</h3>
                    <p className="text-sm font-bold text-orange-500 mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateItem(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.product_id, Math.min(item.quantity + 1, item.stock))}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="ml-auto p-1 text-text-secondary hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-lg font-bold">{formatPrice(cart.total)}</span>
            </div>
            <Link to="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full" size="lg">Checkout</Button>
            </Link>
            <Link
              to="/products"
              onClick={() => setCartOpen(false)}
              className="block text-center text-sm text-text-secondary hover:text-accent"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
