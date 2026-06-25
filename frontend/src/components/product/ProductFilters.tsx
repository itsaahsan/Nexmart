import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface ProductFiltersProps {
  filters: {
    category?: string
    brand?: string
    sort?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
  }
  onFilterChange: (filters: Record<string, string | number | boolean | undefined>) => void
  categories?: string[]
  brands?: string[]
}

export default function ProductFilters({ filters, onFilterChange, categories = [], brands = [] }: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rated' },
    { value: 'popular', label: 'Most Popular' },
  ]

  const priceRanges = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: 'Over $200', min: 200, max: undefined },
  ]

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-text-primary mb-3 text-sm">Sort By</h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ sort: opt.value })}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.sort === opt.value ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-3 text-sm">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange({ category: undefined })}
            className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              !filters.category ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat })}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.category === cat ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-3 text-sm">Price Range</h3>
        <div className="space-y-1">
          {priceRanges.map((range, i) => {
            const isActive = filters.minPrice === range.min && filters.maxPrice === range.max
            return (
              <button
                key={i}
                onClick={() => onFilterChange({ minPrice: range.min, maxPrice: range.max })}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-3 text-sm">Brand</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <button
            onClick={() => onFilterChange({ brand: undefined })}
            className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              !filters.brand ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
            }`}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onFilterChange({ brand })}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.brand === brand ? 'bg-accent text-white' : 'hover:bg-gray-100 text-text-secondary'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={filters.inStock || false}
          onChange={(e) => onFilterChange({ inStock: e.target.checked || undefined })}
          className="rounded border-border text-accent focus:ring-accent"
        />
        <label htmlFor="inStock" className="text-sm text-text-secondary">In Stock Only</label>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium mb-4"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  )
}
