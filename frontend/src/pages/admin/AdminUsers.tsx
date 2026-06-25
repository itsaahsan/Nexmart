import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/admin'
import { formatDate } from '../../utils/formatDate'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminApi.getUsers(page),
  })

  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => adminApi.updateUser(userId, { is_admin: isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User updated')
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Users</h1>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Joined</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users?.map((user: { id: string; full_name: string; email: string; is_admin: boolean; avatar_url?: string; created_at: string }) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent text-white text-xs flex items-center justify-center font-medium">{user.full_name.charAt(0)}</div>
                        )}
                        <span className="text-sm font-medium">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3"><Badge variant={user.is_admin ? 'info' : 'default'}>{user.is_admin ? 'Admin' : 'User'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAdminMutation.mutate({ userId: user.id, isAdmin: !user.is_admin })} className="text-sm text-accent hover:text-accent-hover">
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={users?.pages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
