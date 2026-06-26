// app/admin/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api, Order } from '@/lib/api'
import { 
  Package, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  PackageCheck,
  Loader2,
  Eye
} from 'lucide-react'
import Link from 'next/link'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any; nextStatus?: OrderStatus[] }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    nextStatus: ['confirmed', 'cancelled']
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    nextStatus: ['processing', 'cancelled']
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    nextStatus: ['shipped', 'cancelled']
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    nextStatus: ['delivered']
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: PackageCheck,
    nextStatus: []
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    nextStatus: []
  }
}

export default function AdminOrders() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return
    }
    fetchOrders()
  }, [isAuthenticated, user])

  useEffect(() => {
    let result = orders
    
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(order => 
        order.id.toString().includes(query) ||
        (order.user_id?.toString().includes(query)) ||
        order.status.toLowerCase().includes(query)
      )
    }
    
    setFilteredOrders(result)
  }, [orders, searchQuery, filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const users = await api.getUsers()
      let allOrders: Order[] = []
      
      for (const user of users) {
        try {
          const userOrders = await api.getOrders(user.id)
          allOrders = [...allOrders, ...userOrders]
        } catch (err) {
          // Skip if user has no orders
        }
      }
      
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setOrders(allOrders)
      setFilteredOrders(allOrders)
    } catch (err) {
      setError('Failed to load orders')
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      await api.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      showToast(`Order #${orderId} status updated to ${STATUS_CONFIG[newStatus].label}`, 'success')
    } catch (err) {
      showToast('Failed to update order status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{orders.length}</p>
        </div>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{config.label}</p>
            <p className="text-xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="search-orders"
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              title="Search orders by ID, user ID, or status"
              aria-label="Search orders"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-status" className="sr-only">Filter by status</label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            title="Filter orders by status"
            aria-label="Filter orders by status"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      User #{order.user_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {statusConfig.nextStatus && statusConfig.nextStatus.length > 0 && (
                          <div className="flex items-center gap-1">
                            {statusConfig.nextStatus.map((nextStatus) => {
                              const nextConfig = STATUS_CONFIG[nextStatus]
                              const NextIcon = nextConfig.icon
                              return (
                                <button
                                  key={nextStatus}
                                  onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                  disabled={updatingId === order.id}
                                  className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                                  title={`Mark as ${nextConfig.label}`}
                                  aria-label={`Mark order #${order.id} as ${nextConfig.label}`}
                                >
                                  <NextIcon className="h-4 w-4 text-gray-600" />
                                </button>
                              )
                            })}
                          </div>
                        )}
                        <Link
                        href={`/orders/${order.id}`}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="View Order"
                        aria-label={`View order #${order.id}`}
                        >
                        <Eye className="h-4 w-4 text-blue-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}