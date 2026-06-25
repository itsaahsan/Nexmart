import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import type { Category } from '../../types/cart'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories')
      return res.data as Category[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Categories</h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Description</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{cat.description || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteMutation.mutate(cat.id)} className="text-text-secondary hover:text-error"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
