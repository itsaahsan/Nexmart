import { Link } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { formatPrice } from '../utils/formatPrice'
import { formatDate } from '../utils/formatDate'
import Badge from '../components/ui/Badge'
import Pagination from '../components/ui/Pagination'
import { Package } from 'lucide-react'
import { useState } from 'react'

export default function Orders() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders(page)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data?.orders && data.orders.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-text-secondary">{formatDate(order.created_at)}</p>
                      <p className="text-sm text-text-secondary">{order.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(order.total_amount)}</p>
                    <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'default'}>{order.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary">No orders yet</p>
        </div>
      )}
    </div>
  )
}
