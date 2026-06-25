import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid'
import ProductFilters from '../components/product/ProductFilters'
import Pagination from '../components/ui/Pagination'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    sort: searchParams.get('sort') || 'newest',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    in_stock: searchParams.get('in_stock') === 'true' || undefined,
    search: searchParams.get('search') || undefined,
  })
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const { data, isLoading } = useProducts({ ...filters, page, limit: 12 })

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value))
    })
    if (page > 1) params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }, [filters, page, setSearchParams])

  const handleFilterChange = (newFilters: Record<string, string | number | boolean | undefined>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const products = data?.products || []
  const totalPages = data?.pages || 1

  const categories = [...new Set(products.map((p) => p.category))]
  const brands = [...new Set(products.map((p) => p.brand))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
        <p className="text-text-secondary mt-1">
          {data?.total || 0} products found
          {filters.search && ` for "${filters.search}"`}
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            brands={brands}
          />
        </aside>

        <div className="flex-1">
          <ProductGrid products={products} isLoading={isLoading} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
