import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import ProductCard from './ProductCard'

interface RelatedProductsProps {
  category: string
  currentId: string
}

export default function RelatedProducts({ category, currentId }: RelatedProductsProps) {
  const { data } = useQuery({
    queryKey: ['products', 'related', category],
    queryFn: () => productsApi.list({ category, limit: 4 }),
  })

  const products = data?.products.filter((p) => p.id !== currentId) || []

  if (products.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Related Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
