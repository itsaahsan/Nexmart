import { Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'

export default function OrderConfirmation() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-success" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-text-secondary mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/orders">
          <Button variant="outline" className="gap-2">
            <Package size={18} /> View Orders
          </Button>
        </Link>
        <Link to="/products">
          <Button className="gap-2">
            Continue Shopping <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
