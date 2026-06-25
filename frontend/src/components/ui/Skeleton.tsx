interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-gray-200 rounded ${className}`} />
      ))}
    </>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
      </div>
    </div>
  )
}
