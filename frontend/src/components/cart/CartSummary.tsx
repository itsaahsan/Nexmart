import type { Cart } from '../../types/cart'
import { formatPrice } from '../../utils/formatPrice'

interface CartSummaryProps {
  cart: Cart
}

export default function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Subtotal ({cart.item_count} items)</span>
          <span className="font-medium">{formatPrice(cart.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Shipping</span>
          <span className="font-medium text-success">Free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Tax (estimated)</span>
          <span className="font-medium">{formatPrice(cart.total * 0.08)}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-orange-500">{formatPrice(cart.total * 1.08)}</span>
        </div>
      </div>
    </div>
  )
}
