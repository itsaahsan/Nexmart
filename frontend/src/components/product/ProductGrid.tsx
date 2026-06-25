import type { Product } from '../../types/product'
import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
        <p className="text-text-secondary">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
