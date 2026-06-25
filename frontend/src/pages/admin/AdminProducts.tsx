import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api/admin'
import { formatPrice } from '../../utils/formatPrice'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'

export default function AdminProducts() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => adminApi.getProducts(page),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Products</h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.products.map((product: { id: string; name: string; image_url: string; price: number; stock: number; sku: string; is_active: boolean }) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-text-secondary">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-sm"><span className={product.stock < 10 ? 'text-error' : ''}>{product.stock}</span></td>
                    <td className="px-4 py-3"><Badge variant={product.is_active ? 'success' : 'default'}>{product.is_active ? 'Active' : 'Inactive'}</Badge></td>
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
