import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, login, logout } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    } else if (!localStorage.getItem('access_token')) {
      setUser(null)
    }
    setLoading(false)
  }, [currentUser, setUser, setLoading])

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const placeholderUser = {
        id: '', email: '', full_name: '', is_admin: false, is_verified: false, created_at: ''
      }
      login(placeholderUser, data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      const placeholderUser = {
        id: '', email: '', full_name: '', is_admin: false, is_verified: false, created_at: ''
      }
      login(placeholderUser, data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const logoutHandler = () => {
    logout()
    queryClient.clear()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutHandler,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
