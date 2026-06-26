// components/Reviews.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, User, Trash2, X, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'

interface Review {
  id: number
  product_id: number
  user_id: number
  rating: number
  comment: string
  created_at: string
  users?: {
    username: string
    name: string
  }
}

interface ReviewsProps {
  productId: number
  productName?: string
  autoOpen?: boolean
}

export default function Reviews({ productId, productName, autoOpen = false }: ReviewsProps) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  // ✅ Add a state to track if the review check is complete
  const [reviewCheckComplete, setReviewCheckComplete] = useState(false)
  const userReviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  useEffect(() => {
    // ✅ Only auto-open after review check is complete and user hasn't reviewed
    if (!loading && reviewCheckComplete && autoOpen && !hasReviewed) {
      setShowForm(true)
    }
  }, [loading, reviewCheckComplete, autoOpen, hasReviewed])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setReviewCheckComplete(false)
      const data = await api.getReviews(productId)
      setReviews(data)
      
      if (user) {
        const existing = data.find((r: Review) => r.user_id === user.id)
        setHasReviewed(!!existing)
        setUserReview(existing || null)
        
        if (existing && autoOpen) {
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
      // ✅ Mark review check as complete
      setReviewCheckComplete(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showToast('Please login to leave a review', 'error')
      return
    }

    // ✅ Double-check that user hasn't reviewed
    if (hasReviewed) {
      showToast('You have already reviewed this product', 'error')
      return
    }

    if (rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    setSubmitting(true)
    try {
      const result = await api.createReview(productId, { rating, comment })
      setReviews([result, ...reviews])
      setHasReviewed(true)
      setUserReview(result)
      setShowForm(false)
      setRating(0)
      setComment('')
      showToast('Review submitted successfully! 🎉', 'success')
      
      setTimeout(() => {
        userReviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    } catch (error: any) {
      if (error.message?.includes('already reviewed')) {
        showToast('You have already reviewed this product', 'error')
        // ✅ Refresh to update state
        fetchReviews()
      } else {
        showToast('Failed to submit review', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await api.deleteReview(reviewId)
      setReviews(reviews.filter(r => r.id !== reviewId))
      setHasReviewed(false)
      setUserReview(null)
      showToast('Review deleted successfully', 'success')
    } catch (error) {
      showToast('Failed to delete review', 'error')
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  // ✅ Show loading spinner while checking reviews
  if (loading || !reviewCheckComplete) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-6 pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground/80 mt-1">{reviews.length} reviews</p>
        </div>
      </div>

      {/* ✅ Write Review Section - Only show when review check is complete */}
      {isAuthenticated && reviewCheckComplete && (
        <div className="flex items-center justify-between">
          {!hasReviewed ? (
            !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                title="Write a review for this product"
                aria-label="Write a review for this product"
              >
                Write a Review
              </button>
            ) : null
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (userReview?.rating || 0)
                        ? 'fill-green-500 text-green-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-green-600">You've already reviewed this product</span>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {showForm && !hasReviewed && reviewCheckComplete && (
        <form onSubmit={handleSubmit} className="bg-muted rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Write a Review</h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setRating(0)
                setComment('')
              }}
              className="text-gray-400 hover:text-muted-foreground transition-colors"
              title="Close review form"
              aria-label="Close review form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                title={`Rate ${star} stars`}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={3}
            required
            title="Write your review"
            aria-label="Write your review"
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
              title="Submit your review"
              aria-label="Submit your review"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setRating(0)
                setComment('')
              }}
              className="px-4 py-2 border border-gray-300 text-foreground/80 rounded-lg hover:bg-muted transition-colors text-sm"
              title="Cancel review"
              aria-label="Cancel review"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* User's Own Review */}
      {userReview && (
        <div 
          ref={userReviewRef}
          id="user-review"
          className="bg-primary/10 rounded-lg p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your Review</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= userReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleDelete(userReview.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete your review"
                aria-label="Delete your review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{userReview.comment}</p>
        </div>
      )}

      {/* All Reviews */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">All Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground/80 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => {
            if (user && review.user_id === user.id) return null
            return (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {review.users?.name || review.users?.username || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}