import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import CompareBar from './components/product/CompareBar'
import { useAuth } from './hooks/useAuth'
import { useCartStore } from './store/cartStore'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Profile = lazy(() => import('./pages/Profile'))
const Addresses = lazy(() => import('./pages/Addresses'))
const Compare = lazy(() => import('./pages/Compare'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-text-secondary">Loading...</div></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !user?.is_admin) return <Navigate to="/" replace />
  return <>{children}</>
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="space-y-4 w-full max-w-md px-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { cart, clearCart } = useCartStore()

  useEffect(() => {
    if (cart.items.length === 0) return
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/products?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        const validIds = new Set(data.products.map((p: { id: string }) => p.id))
        const stale = cart.items.some((i) => !validIds.has(i.product_id))
        if (stale) {
          clearCart()
        }
      })
      .catch(() => {})
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <CompareBar />
      <main className="flex-1 pt-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
