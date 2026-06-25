import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Minus, Plus } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../hooks/useAuth'
import { formatPrice } from '../utils/formatPrice'
import Button from '../components/ui/Button'

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart } = useCartStore()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
    } else {
      navigate('/checkout')
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-text-secondary mb-6">Start shopping to add items to your cart</p>
        <Link to="/products"><Button>Start Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product_id} className="flex gap-4 p-4 border border-border rounded-xl bg-white">
              <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="text-sm font-medium hover:text-accent truncate block">{item.name}</Link>
                <p className="text-lg font-bold text-orange-500 mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateItem(item.product_id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50"><Minus size={14} /></button>
                  <span className="text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateItem(item.product_id, Math.min(item.quantity + 1, item.stock))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50"><Plus size={14} /></button>
                  <button onClick={() => removeItem(item.product_id)} className="ml-auto p-2 text-text-secondary hover:text-error transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-text-secondary hover:text-error transition-colors">Clear Cart</button>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 sticky top-24 h-fit">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Subtotal ({cart.item_count} items)</span><span className="font-medium">{formatPrice(cart.total)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span className="font-medium text-success">Free</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Tax (estimated)</span><span className="font-medium">{formatPrice(cart.total * 0.08)}</span></div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-orange-500">{formatPrice(cart.total * 1.08)}</span>
            </div>
          </div>
          <Button onClick={handleCheckout} className="w-full mt-6" size="lg">Proceed to Checkout</Button>
          <Link to="/products" className="block text-center text-sm text-text-secondary hover:text-accent mt-3">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
