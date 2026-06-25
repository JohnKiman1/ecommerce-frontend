'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Trash2, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { cart, totalItems, totalPrice, isLoading, updateItem, removeItem, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear cart')
      }
    }
  }

  // Safe check for empty cart
  if (!isLoading && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
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
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.products?.image || '/images/placeholder.png'}
                    alt={item.products?.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <Link href={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {item.products?.name || 'Product'}
                  </Link>
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  <p className="font-semibold text-lg text-gray-900">${(item.products?.price || 0).toFixed(2)}</p>
                </div>

                {/* Quantity and Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isUpdating === item.id}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-50"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={isUpdating === item.id || item.quantity <= 1}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="px-2 font-semibold min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={isUpdating === item.id}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 text-sm transition-colors"
                >
                  Clear Cart
                </button>
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
    </div>
  )
}