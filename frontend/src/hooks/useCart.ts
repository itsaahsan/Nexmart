import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cart'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export const useCart = () => {
  const { setCart } = useCartStore()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.get()
      setCart(data)
      return data
    },
    enabled: !!localStorage.getItem('access_token'),
  })

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: (data) => {
      setCart(data)
      queryClient.setQueryData(['cart'], data)
      toast.success('Added to cart')
    },
    onError: () => {
      toast.error('Failed to add to cart')
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(productId, quantity),
    onSuccess: (data) => {
      setCart(data)
      queryClient.setQueryData(['cart'], data)
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Removed from cart')
    },
  })

  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      setCart({ items: [], total: 0, item_count: 0 })
      queryClient.setQueryData(['cart'], { items: [], total: 0, item_count: 0 })
    },
  })

  return {
    cart,
    isLoading,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearMutation.mutate,
    isAdding: addItemMutation.isPending,
  }
}
