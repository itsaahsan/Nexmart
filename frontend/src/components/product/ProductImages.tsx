import { useState } from 'react'

interface ProductImagesProps {
  image_url: string
  images?: string[]
}

export default function ProductImages({ image_url, images = [] }: ProductImagesProps) {
  const allImages = [image_url, ...images.filter((img) => img !== image_url)]
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-border">
        <img
          src={allImages[selectedIndex]}
          alt="Product"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23e5e7eb"><rect width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af">No Image Available</text></svg>')
            e.currentTarget.className = 'w-full h-full object-contain bg-gray-100'
          }}
        />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selectedIndex ? 'border-accent' : 'border-border hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"><rect width="80" height="80" rx="6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="8" fill="%239ca3af">N/A</text></svg>')
                  e.currentTarget.className = 'w-full h-full object-contain bg-gray-100'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
