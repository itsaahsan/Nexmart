import { useParams, Link } from 'react-router-dom'
import { useOrder } from '../hooks/useOrders'
import { formatPrice } from '../utils/formatPrice'
import { formatDate } from '../utils/formatDate'
import Badge from '../components/ui/Badge'
import { ChevronRight } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading } = useOrder(id || '')

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Link to="/orders" className="text-accent hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/orders" className="hover:text-accent">Orders</Link>
        <ChevronRight size={14} />
        <span className="text-text-primary">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-text-secondary">{formatDate(order.created_at)}</p>
        </div>
        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'default'} className="text-sm">{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price_at_purchase * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.shipping_address && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">Shipping Address</h2>
              <div className="text-sm text-text-secondary space-y-1">
                <p>{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span>{formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-orange-500">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
