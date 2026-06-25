import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react'
import { useFeaturedProducts } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'

export default function Home() {
  const { data: featuredProducts, isLoading } = useFeaturedProducts()

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8 leading-relaxed">
              Discover curated products that combine quality, style, and value.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="gap-2">
                  Shop Now <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-xl border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <feature.icon size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-text-secondary mt-1">Handpicked items just for you</p>
          </div>
          <Link to="/products" className="text-accent hover:text-accent-hover font-medium text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-white overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  </div>
                </div>
              ))
            : featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-accent rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the Nexmart Community</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get exclusive access to new arrivals and special offers.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-text-primary focus:outline-none"
            />
            <button className="px-6 py-3 bg-primary text-white font-medium rounded-r-lg hover:bg-secondary transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
