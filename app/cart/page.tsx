'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'
import { Trash2, ArrowRight, Minus, Plus, X, ShoppingBag, Pencil } from 'lucide-react'

export default function CartPage() {
  const { cart, totalItems, totalPrice, isLoading, updateItem, removeItem, clearCart, addItem } = useCart()
  const { showToast } = useToast()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Custom confirmation dialog state
  const [showClearCartDialog, setShowClearCartDialog] = useState(false)
  
  // Size edit state
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')

  // Calculate totals
  const subtotal = totalPrice
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setIsUpdating(itemId)
    setError(null)
    try {
      await updateItem(itemId, newQuantity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    setIsUpdating(itemId)
    setError(null)
    try {
      await removeItem(itemId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setIsUpdating(null)
    }
  }

  // ✅ Handle size change - properly remove old and add new
  const handleSizeChange = async (itemId: number, newSize: string) => {
    setIsUpdating(itemId)
    setError(null)
    try {
      const item = cart.find(i => i.id === itemId)
      if (!item) {
        throw new Error('Item not found')
      }
      
      // ✅ Remove old item
      await removeItem(itemId)
      
      // ✅ Add new item with new size (addItem will merge if duplicate)
      await addItem(item.product_id, item.quantity, newSize)
      
      setEditingItemId(null)
      showToast('Size updated successfully!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update size')
      showToast('Failed to update size', 'error')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleClearCartClick = () => {
    setShowClearCartDialog(true)
  }

  const confirmClearCart = async () => {
    setShowClearCartDialog(false)
    try {
      await clearCart()
      showToast('Cart cleared successfully!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart')
      showToast('Failed to clear cart', 'error')
    }
  }

  const cancelClearCart = () => {
    setShowClearCartDialog(false)
  }

  // Safe check for empty cart
  if (!isLoading && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-600">Start shopping to add items to your cart</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      {/* Custom Clear Cart Confirmation Dialog */}
      {showClearCartDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
              <button
                onClick={cancelClearCart}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to clear your cart?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClearCart}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Cancel"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Clear Cart"
                aria-label="Clear Cart"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.products
              const availableSizes = product?.sizes || []
              
              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray-200 bg-white">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    <Image
                      src={product?.image || '/images/placeholder.png'}
                      alt={product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <Link href={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {product?.name || 'Product'}
                    </Link>
                    
                    {/* Size with edit capability */}
                    <div className="flex items-center gap-2">
                      {editingItemId === item.id ? (
                        // Size edit mode
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                            title="Select size"
                          >
                            {availableSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSizeChange(item.id, selectedSize)}
                            disabled={isUpdating === item.id}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            title="Save size"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            Size: <span className="font-medium text-gray-700">{item.size || 'Not selected'}</span>
                          </p>
                          {availableSizes.length > 0 && (
                            <button
                              onClick={() => {
                                setEditingItemId(item.id)
                                setSelectedSize(item.size || availableSizes[0])
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                              title="Change size"
                            >
                              <Pencil className="h-3 w-3" />
                              Change
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="font-semibold text-lg text-gray-900">${(product?.price || 0).toFixed(2)}</p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating === item.id || item.quantity <= 1}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                        title="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 font-semibold min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                        title="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating === item.id}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-50"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Clear Cart Button */}
            {cart && cart.length > 0 && (
              <button
                onClick={handleClearCartClick}
                className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                title="Clear cart"
                aria-label="Clear cart"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {subtotal > 100 && <p className="text-sm text-green-600 font-semibold">✓ Free shipping applied!</p>}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>

              <Link
                href="/shop"
                className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-semibold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}