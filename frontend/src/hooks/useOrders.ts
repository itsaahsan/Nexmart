import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders'
import type { CartItem } from '../types/cart'
import toast from 'react-hot-toast'

export const useOrders = (page: number = 1, status?: string) => {
  return useQuery({
    queryKey: ['orders', page, status],
    queryFn: () => ordersApi.list(page, status),
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shippingAddress,
      items,
    }: {
      shippingAddress: Record<string, string>
      items: CartItem[]
    }) => {
      await ordersApi.createPaymentIntent(items)
      return ordersApi.create(shippingAddress, 'pi_demo', items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.setQueryData(['cart'], { items: [], total: 0, item_count: 0 })
      toast.success('Order placed successfully!')
    },
    onError: () => {
      toast.error('Failed to place order')
    },
  })
}
