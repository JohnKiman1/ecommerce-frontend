// app/profile/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { 
  LogOut, User, Mail, Phone, Shield, Calendar, Save, Edit, X, 
  Package, MapPin, ShoppingBag, Plus, Home, Building2, Trash2, Check, ChevronRight
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'

type TabType = 'profile' | 'orders' | 'addresses'

interface Address {
  id: string
  type: 'shipping' | 'billing'
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

function ProfileContent() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  
  // ✅ Get tab from URL query parameter
  const tabParam = searchParams.get('tab') as TabType | null
  
  // ✅ Set active tab from query param or default to 'profile'
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<{
    id: number
    username: string
    email: string
    name: string
    phone: string
    role: string
    created_at: string
  } | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    type: 'shipping',
    isDefault: false,
  })

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; street: string } | null>(null)

  // ✅ Update activeTab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['profile', 'orders', 'addresses'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchProfile()
    fetchOrders()
    fetchAddresses()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await api.getProfile(user.id)
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      })
    } catch (err) {
      showToast('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

// Update the fetchOrders function
const fetchOrders = async () => {
  if (!user) return
  try {
    setLoadingOrders(true)
    console.log('📝 Fetching orders for user:', user.id)
    
    const data = await api.getOrders(user.id)
    console.log('📦 Orders data:', data)
    console.log('📦 Orders count:', data ? data.length : 0)
    
    // Parse items if they're stored as JSON string
    const ordersWithItems = (data || []).map((order: any) => ({
      ...order,
      items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : []
    }))
    
    console.log('✅ Parsed orders:', ordersWithItems)
    setOrders(ordersWithItems)
    
    if (ordersWithItems.length === 0) {
      console.log('ℹ️ No orders found for user:', user.id)
    }
  } catch (err) {
    console.error('❌ Failed to load orders:', err)
    showToast('Failed to load orders', 'error')
  } finally {
    setLoadingOrders(false)
  }
}

  const fetchAddresses = async () => {
    // For now, use mock data since backend doesn't have addresses table yet
    const mockAddresses: Address[] = [
      {
        id: '1',
        type: 'shipping',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        isDefault: true,
      },
      {
        id: '2',
        type: 'billing',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'US',
        isDefault: false,
      },
    ]
    setAddresses(mockAddresses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (formData.phone && !/^[\d\s\-+()]{7,15}$/.test(formData.phone)) {
      showToast('Please enter a valid phone number', 'error')
      return
    }

    setSaving(true)

    try {
      const updated = await api.updateProfile(user.id, formData)
      setProfile(updated)
      setIsEditing(false)
      showToast('Profile updated successfully! 🎉', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    showToast('Logged out successfully', 'info')
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      })
    }
    setIsEditing(false)
  }

  // ============ ADDRESS CRUD OPERATIONS ============

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    const newAddr: Address = {
      id: Date.now().toString(),
      ...newAddress,
    }

    let updatedAddresses = [...addresses, newAddr]
    if (newAddress.isDefault || addresses.length === 0) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === newAddr.id,
      }))
    }

    setAddresses(updatedAddresses)
    resetAddressForm()
    showToast('Address added successfully! 🎉', 'success')
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setNewAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      type: address.type,
      isDefault: address.isDefault,
    })
    setShowAddressForm(true)
  }

  const handleUpdateAddress = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    let updatedAddresses = addresses.map(addr => {
      if (addr.id === editingAddressId) {
        return {
          ...addr,
          ...newAddress,
        }
      }
      return addr
    })

    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === editingAddressId,
      }))
    }

    setAddresses(updatedAddresses)
    resetAddressForm()
    showToast('Address updated successfully! 🎉', 'success')
  }

  const handleDeleteClick = (id: string, street: string) => {
    setAddressToDelete({ id, street })
    setShowConfirmDialog(true)
  }

  const confirmDelete = () => {
    if (!addressToDelete) return
    
    const updatedAddresses = addresses.filter(addr => addr.id !== addressToDelete.id)
    setAddresses(updatedAddresses)
    setShowConfirmDialog(false)
    setAddressToDelete(null)
    showToast('Address deleted successfully', 'success')
  }

  const cancelDelete = () => {
    setShowConfirmDialog(false)
    setAddressToDelete(null)
  }

  const handleSetDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updatedAddresses)
    showToast('Default address updated', 'success')
  }

  const resetAddressForm = () => {
    setShowAddressForm(false)
    setEditingAddressId(null)
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      type: 'shipping',
      isDefault: false,
    })
  }

  // Order status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const displayProfile = profile || {
    id: user.id,
    username: user.username,
    email: user.email || '',
    name: user.name || '',
    phone: user.phone || '',
    role: user.role,
    created_at: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Custom Confirmation Dialog */}
        {showConfirmDialog && addressToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-slide-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Address</h3>
                <button
                  onClick={cancelDelete}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete this address?
                </p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  "{addressToDelete.street}"
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your profile, orders, and addresses</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  // Update URL without page refresh
                  router.replace(`/profile?tab=${tab.id}`, { scroll: false })
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* ============ PROFILE TAB ============ */}
          {activeTab === 'profile' && (
            <div className="p-6">
              {/* Profile Header */}
              <div className="bg-blue-600 -m-6 px-6 py-8 mb-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                    <span className="text-3xl font-bold text-white">
                      {displayProfile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">
                      {displayProfile.name || displayProfile.username}
                    </h2>
                    <p className="text-blue-100">@{displayProfile.username}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      displayProfile.role === 'admin' 
                        ? 'bg-purple-200 text-purple-800' 
                        : displayProfile.role === 'locked'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-white/20 text-white'
                    }`}>
                      {displayProfile.role}
                    </span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="profile-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="profile-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="profile-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Format: +1 234 567 890</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {displayProfile.name || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Username</label>
                      <p className="text-lg font-semibold text-gray-900">@{displayProfile.username}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Email Address</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {displayProfile.email || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {displayProfile.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Role</label>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{displayProfile.role}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-500">Member Since</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(displayProfile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ ORDERS TAB ============ */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">Order #{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${(order.total || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                          <span className="text-xs text-blue-600 flex items-center gap-1 justify-end mt-1">
                            View Details <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't placed any orders yet</p>
                  <a
                    href="/shop"
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ============ ADDRESSES TAB ============ */}
          {activeTab === 'addresses' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                <button
                  onClick={() => {
                    resetAddressForm()
                    setShowAddressForm(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close address form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address-street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        id="address-street"
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St"
                        required
                        title="Enter your street address"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        id="address-city"
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New York"
                        required
                        title="Enter your city"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-state" className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        id="address-state"
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="NY"
                        required
                        title="Enter your state"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-zip" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        id="address-zip"
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10001"
                        required
                        title="Enter your ZIP code"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        id="address-country"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        title="Select your country"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="address-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <select
                        id="address-type"
                        value={newAddress.type}
                        onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'shipping' | 'billing' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        title="Select address type"
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        aria-label="Set as default address"
                        title="Set as default address"
                      />
                      <span className="text-sm text-gray-700">Set as default address</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative hover:shadow-sm transition-shadow">
                      {address.isDefault && (
                        <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" /> Default
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {address.type === 'shipping' ? (
                          <Home className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-900 capitalize">{address.type}</span>
                      </div>
                      <p className="text-sm text-gray-600">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(address.id, address.street)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No addresses saved yet</p>
                  <button
                    onClick={() => {
                      resetAddressForm()
                      setShowAddressForm(true)
                    }}
                    className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ✅ Main page component with Suspense boundary
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}