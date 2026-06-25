import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { formatPrice } from '../utils/formatPrice'
import { formatDate } from '../utils/formatDate'
import Badge from '../components/ui/Badge'
import { Package, Heart, Settings, MapPin, ShoppingBag } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { data } = useOrders(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
      <p className="text-text-secondary mb-8">Welcome back, {user?.full_name}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package, label: 'Orders', value: data?.total || 0, to: '/orders' },
          { icon: Heart, label: 'Wishlist', value: 'View', to: '/wishlist' },
          { icon: MapPin, label: 'Addresses', value: 'Manage', to: '/addresses' },
          { icon: Settings, label: 'Profile', value: 'Edit', to: '/profile' },
        ].map((item) => (
          <Link key={item.label} to={item.to} className="bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <item.icon size={24} className="text-accent mb-2" />
            <p className="text-sm font-medium text-text-primary">{item.label}</p>
            <p className="text-xs text-text-secondary">{item.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-accent hover:text-accent-hover">View All</Link>
        </div>
        {data?.orders && data.orders.length > 0 ? (
          <div className="space-y-3">
            {data.orders.slice(0, 5).map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-text-secondary">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(order.total_amount)}</p>
                  <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'default'}>{order.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-secondary py-8">No orders yet</p>
        )}
      </div>
    </div>
  )
}
