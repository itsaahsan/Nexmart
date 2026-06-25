import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    try {
      await api.post('/api/newsletter/subscribe', { email })
      toast.success('Subscribed to newsletter!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="bg-primary text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold tracking-tight mb-4">Nexmart</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Shop smarter with our curated collection of premium products.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
              <li><Link to="/products?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Compare Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-sm">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-3">Get the latest deals and updates.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Nexmart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
