import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Review } from '../../types/cart'
import Rating from '../ui/Rating'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'
import api from '../../api/axios'

interface ProductReviewsProps {
  reviews: Review[]
  productId: string
  onRefresh?: () => void
}

export default function ProductReviews({ reviews, productId, onRefresh }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/reviews', {
        product_id: productId,
        rating,
        title,
        body,
      })
      toast.success('Review submitted!')
      setShowForm(false)
      setTitle('')
      setBody('')
      setRating(5)
      onRefresh?.()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Review</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Share your experience..."
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button type="submit" isLoading={submitting}>Submit Review</Button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Rating value={review.rating} size="sm" />
                <p className="text-sm font-medium text-text-primary mt-1">{review.title}</p>
              </div>
              <span className="text-xs text-text-secondary">{review.user_name}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-text-secondary py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  )
}
