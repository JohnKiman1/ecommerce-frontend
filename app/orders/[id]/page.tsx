// app/orders/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'
import { 
  ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, 
  Star, CreditCard, MapPin, RefreshCw, PackageCheck
} from 'lucide-react'
import Link from 'next/link'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any; nextStatus: OrderStatus[] }> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600 bg-yellow-50',
    icon: Clock,
    nextStatus: ['confirmed', 'cancelled']
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-600 bg-blue-50',
    icon: CheckCircle,
    nextStatus: ['processing', 'cancelled']
  },
  processing: {
    label: 'Processing',
    color: 'text-purple-600 bg-purple-50',
    icon: Package,
    nextStatus: ['shipped', 'cancelled']
  },
  shipped: {
    label: 'Shipped',
    color: 'text-indigo-600 bg-indigo-50',
    icon: Truck,
    nextStatus: ['delivered']
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600 bg-green-50',
    icon: PackageCheck,
    nextStatus: []
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 bg-red-50',
    icon: XCircle,
    nextStatus: []
  }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchOrder()
  }, [isAuthenticated, router, orderId])

  const fetchOrder = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await api.getOrder(user.id, parseInt(orderId))
      setOrder(data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      showToast('Failed to load order details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return
    setUpdating(true)
    try {
      await api.updateOrderStatus(order.id, newStatus)
      setOrder({ ...order, status: newStatus })
      showToast(`Order status updated to ${STATUS_CONFIG[newStatus].label}`, 'success')
    } catch (error) {
      showToast('Failed to update order status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    return STATUS_CONFIG[status as OrderStatus]?.icon || Clock
  }

  const getStatusColor = (status: string) => {
    return STATUS_CONFIG[status as OrderStatus]?.color || 'text-gray-600 bg-gray-50'
  }

  const getStatusLabel = (status: string) => {
    return STATUS_CONFIG[status as OrderStatus]?.label || status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleRating = (productId: number) => {
    setReviewingProductId(productId)
    setShowReviewForm(true)
  }

  const submitReview = async () => {
    if (!rating || !reviewingProductId) {
      showToast('Please select a rating and write a review', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.createReview(reviewingProductId, { rating, comment: review })
      showToast('Review submitted successfully! 🎉', 'success')
      setShowReviewForm(false)
      setRating(0)
      setReview('')
      setReviewingProductId(null)
    } catch (error) {
      showToast('Failed to submit review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-gray-500 mt-2">This order doesn't exist or you don't have access.</p>
          <Link
            href="/profile?tab=orders"
            className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(order.status)
  const statusConfig = STATUS_CONFIG[order.status as OrderStatus]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/profile?tab=orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          title="Go back to orders"
          aria-label="Go back to orders"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="font-medium">{getStatusLabel(order.status)}</span>
            </div>
          </div>
        </div>

        {/* Order Status Management (Admin Only) */}
        {user?.role === 'admin' && statusConfig.nextStatus && statusConfig.nextStatus.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order Status Management</h3>
                <p className="text-sm text-gray-500 mt-1">Update the status of this order</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {statusConfig.nextStatus.map((nextStatus) => {
                  const nextConfig = STATUS_CONFIG[nextStatus]
                  const NextIcon = nextConfig.icon
                  return (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusUpdate(nextStatus)}
                      disabled={updating}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        nextStatus === 'cancelled'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updating ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <NextIcon className="h-3.5 w-3.5" />
                      )}
                      {nextConfig.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>Current Status:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  <StatusIcon className="h-3 w-3" />
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {(order.items || []).map((item: any, index: number) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img 
                    src={item.image || '/images/placeholder.png'} 
                    alt={item.productName || 'Product'} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName || `Product ${item.productId}`}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Rate Your Products Section - Only for delivered orders */}
        {order.status === 'delivered' && order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Rate Your Products</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Help other customers by sharing your experience with these products.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.items.map((item: any) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <img 
                    src={item.image || '/images/placeholder.png'} 
                    alt={item.productName} 
                    className="h-12 w-12 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <button
                      onClick={() => router.push(`/product/${item.productId}?rate=true`)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Write a Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {order.shipping_address && typeof order.shipping_address === 'object' ? (
                <>
                  {order.shipping_address.firstName && (
                    <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                  )}
                  <p>{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                  <p>{order.shipping_address.country}</p>
                </>
              ) : (
                <p className="text-gray-400">No shipping address available</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">${(order.shipping || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${(order.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 text-sm text-gray-500">
                <CreditCard className="h-4 w-4" />
                <span>Paid via {order.payment_method ? order.payment_method.replace('_', ' ').toUpperCase() : 'Credit Card'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}