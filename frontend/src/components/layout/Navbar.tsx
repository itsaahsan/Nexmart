import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Package, Heart, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../store/cartStore'
import { productsApi } from '../../api/products'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cart, toggleCart } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (value.length >= 2) {
        const results = await productsApi.searchSuggestions(value)
        setSuggestions(results)
      } else {
        setSuggestions([])
      }
    }, 500)
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSuggestions([])
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-primary">Nexmart</Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/products" className={`text-sm font-medium transition-colors hover:text-accent ${location.pathname === '/products' ? 'text-accent' : 'text-text-secondary'}`}>Shop</Link>
            </div>
          </div>

          <div className="flex items-center gap-2" ref={searchRef}>
            <div className="relative hidden sm:block">
              <form onSubmit={submitSearch} className="flex items-center">
                <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => setSearchOpen(true)} placeholder="Search products..." className="w-64 lg:w-80 rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
                <button type="submit" className="absolute right-3 text-text-secondary hover:text-text-primary"><Search size={18} /></button>
              </form>
              {searchOpen && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { navigate(`/products?search=${encodeURIComponent(s)}`); setSearchOpen(false); setSuggestions([]) }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-text-primary">{s}</button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleCart} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingBag size={20} />
              {cart.item_count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-medium rounded-full flex items-center justify-center">{cart.item_count}</span>
              )}
            </button>

            <div className="relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-medium">{user?.full_name?.charAt(0) || 'U'}</div>
                  )}
                  <ChevronDown size={16} className="text-text-secondary" />
                </button>
              ) : (
                <Link to="/login" className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center"><User size={20} className="text-text-secondary" /></Link>
              )}

              {userMenuOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user?.full_name}</p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-text-primary"><LayoutDashboard size={16} /> Dashboard</Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-text-primary"><Package size={16} /> Orders</Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-text-primary"><Heart size={16} /> Wishlist</Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-text-primary"><Settings size={16} /> Profile</Link>
                  {user?.is_admin && <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-accent font-medium"><LayoutDashboard size={16} /> Admin Panel</Link>}
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/') }} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-error w-full"><LogOut size={16} /> Sign out</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={submitSearch} className="sm:hidden">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-border px-4 py-2.5 text-sm" />
            </form>
            <Link to="/products" className="block py-2 text-sm font-medium text-text-secondary hover:text-accent">Shop</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-sm font-medium text-text-secondary hover:text-accent">Dashboard</Link>
                <Link to="/orders" className="block py-2 text-sm font-medium text-text-secondary hover:text-accent">Orders</Link>
                <button onClick={() => { logout(); navigate('/') }} className="block py-2 text-sm font-medium text-error hover:text-error">Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-sm font-medium text-accent hover:text-accent-hover">Log In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
