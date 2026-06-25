import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/admin'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'
import type { Order } from '../../types/order'

export default function AdminOrders() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter],
    queryFn: () => adminApi.getOrders(page, statusFilter || undefined),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Order status updated')
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button key={status} onClick={() => { setStatusFilter(status); setPage(1) }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-accent text-white' : 'bg-white border border-border hover:bg-gray-50'}`}>
            {status || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Total</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3"><Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'info' : 'default'}>{order.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })} className="text-sm border border-border rounded-lg px-2 py-1">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={data?.pages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
