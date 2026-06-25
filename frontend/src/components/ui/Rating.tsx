import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
}

export default function Rating({ value, count, size = 'md' }: RatingProps) {
  const starSize = size === 'sm' ? 14 : 16

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={star <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className={`text-text-secondary ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={`text-text-secondary ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({count})
        </span>
      )}
    </div>
  )
}
