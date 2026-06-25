import { Link } from 'react-router-dom'
import { X, BarChart3 } from 'lucide-react'
import { useCompareStore } from '../../store/compareStore'

export default function CompareBar() {
  const { items, removeItem, clearAll } = useCompareStore()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-accent" />
          <span className="text-sm font-medium">{items.length} product{items.length > 1 ? 's' : ''} to compare</span>
          <div className="flex items-center gap-2">
            {items.map((p) => (
              <div key={p.id} className="relative group">
                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#e5e7eb"><rect width="40" height="40" rx="4"/></svg>') }} />
                <button
                  onClick={() => removeItem(p.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={clearAll} className="text-xs text-text-secondary hover:text-error">Clear</button>
          <Link
            to="/compare"
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  )
}
