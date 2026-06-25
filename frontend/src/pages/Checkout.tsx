import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../hooks/useAuth'
import { ordersApi } from '../api/orders'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatPrice } from '../utils/formatPrice'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { cart, clearCart } = useCartStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart')
    }
  }, [cart.items.length, navigate])

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async () => {
    setProcessing(true)
    try {
      await ordersApi.createPaymentIntent(cart.items)
      await ordersApi.create(shippingAddress, 'pi_demo', cart.items)
      clearCart()
      navigate('/order-confirmation')
      toast.success('Order placed successfully!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (msg && msg.includes('not found')) {
        toast.error('Some items are no longer available. Cart has been cleared.')
        clearCart()
        navigate('/products')
      } else {
        toast.error('Payment failed. Please try again.')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="flex items-center gap-4 mb-8">
        {['Shipping', 'Payment'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > i + 1 ? 'bg-success text-white' : step === i + 1 ? 'bg-accent text-white' : 'bg-gray-200 text-text-secondary'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-text-primary' : 'text-text-secondary'}`}>
              {label}
            </span>
            {i < 1 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.full_name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Address Line 1"
                value={shippingAddress.address_line1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                required
              />
              <Input
                label="Address Line 2 (optional)"
                value={shippingAddress.address_line2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  required
                />
                <Input
                  label="Postal Code"
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full">Continue to Payment</Button>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Payment</h2>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-text-secondary mb-4">This is a demo checkout. No real payment will be charged.</p>
                <p className="text-sm text-text-secondary">Stripe integration is configured for test mode.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} size="lg" className="flex-1">Back</Button>
                <Button onClick={handlePayment} isLoading={processing} size="lg" className="flex-1">Place Order</Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-xl p-6 sticky top-24 h-fit">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex gap-3 items-center">
                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#e5e7eb"><rect width="48" height="48" rx="8"/></svg>') }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span className="text-success">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span>{formatPrice(cart.total * 0.08)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-orange-500">{formatPrice(cart.total * 1.08)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
