import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import Badge from '../../components/ui/Badge'
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Revenue', value: formatPrice(stats?.total_revenue || 0), color: 'text-success' },
          { icon: ShoppingCart, label: 'Orders', value: stats?.total_orders || 0, color: 'text-accent' },
          { icon: Users, label: 'Users', value: stats?.total_users || 0, color: 'text-blue-500' },
          { icon: Package, label: 'Products', value: stats?.total_products || 0, color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-4">
            <stat.icon size={24} className={stat.color} />
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-accent hover:text-accent-hover">View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{order.user_name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'default'}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {stats?.top_products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-text-secondary">{product.review_count} reviews</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/admin/products', label: 'Manage Products' },
          { to: '/admin/orders', label: 'Manage Orders' },
          { to: '/admin/users', label: 'Manage Users' },
          { to: '/admin/categories', label: 'Manage Categories' },
        ].map((link) => (
          <Link key={link.to} to={link.to} className="bg-white border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
            <p className="font-medium text-sm">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
