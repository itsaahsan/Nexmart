interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

const variants = {
  default: 'bg-gray-100 text-text-secondary',
  success: 'bg-green-100 text-success',
  warning: 'bg-yellow-100 text-warning',
  error: 'bg-red-100 text-error',
  info: 'bg-blue-100 text-blue-600',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
