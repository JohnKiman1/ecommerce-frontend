// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'
import { Star, Trash2, User, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Review {
  id: number
  product_id: number
  user_id: number
  rating: number
  comment: string
  status: string
  created_at: string
  product_name?: string  // ✅ Made optional
  users?: {
    username: string
    name: string
  }
  products?: {
    name: string
  }
}

export default function AdminReviews() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return
    }
    fetchReviews()
  }, [isAuthenticated, user])

  useEffect(() => {
    let result = reviews
    if (filterStatus !== 'all') {
      result = result.filter(review => review.status === filterStatus)
    }
    setFilteredReviews(result)
  }, [reviews, filterStatus])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Fetch all reviews - get products first, then their reviews
      const products = await api.getProducts()
      let allReviews: Review[] = []
      
      for (const product of products) {
        try {
          const productReviews = await api.getReviews(product.id)
          // ✅ Add product_name to each review
          const reviewsWithProduct = productReviews.map((r: any) => ({ 
            ...r, 
            product_name: product.name 
          }))
          allReviews = [...allReviews, ...reviewsWithProduct]
        } catch (err) {
          // Skip if no reviews
        }
      }
      
      setReviews(allReviews)
      setFilteredReviews(allReviews)
    } catch (err) {
      setError('Failed to load reviews')
      showToast('Failed to load reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeletingId(reviewId)
    try {
      await api.deleteReview(reviewId)
      setReviews(reviews.filter(r => r.id !== reviewId))
      showToast('Review deleted successfully', 'success')
    } catch (err) {
      showToast('Failed to delete review', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const statusCounts = reviews.reduce((acc, review) => {
    acc[review.status] = (acc[review.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground/80 mt-1">Manage customer reviews</p>
        </div>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-muted-foreground/80">Total Reviews</p>
          <p className="text-xl font-bold text-foreground">{reviews.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-muted-foreground/80">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-muted-foreground/80">Approved</p>
          <p className="text-xl font-bold text-green-600">{statusCounts.approved || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            title="Filter reviews by status"
            aria-label="Filter reviews by status"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Comment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {review.product_name || review.products?.name || `Product #${review.product_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {review.users?.name || review.users?.username || `User #${review.user_id}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      review.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                      {review.status === 'rejected' && <XCircle className="h-3 w-3" />}
                      {review.status === 'pending' && <Clock className="h-3 w-3" />}
                      {review.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      title="Delete review"
                      aria-label="Delete review"
                    >
                      {deletingId === review.id ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground/80">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  )
}