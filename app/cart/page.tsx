'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { getProductById, MOCK_PRODUCTS } from '@/lib/mockData'
import { Trash2, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart()

  const cartItemsWithDetails = cart.items
    .map((item) => {
      const product = getProductById(item.productId)
      return product ? { ...item, product } : null
    })
    .filter(Boolean)

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item?.product?.price || 0) * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItemsWithDetails.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground">Start shopping to add items to your cart</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItemsWithDetails.map((item) =>
              item && item.product ? (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <Link href={`/product/${item.product.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {item.product.name}
                    </Link>
                    {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                    <p className="font-semibold text-lg text-foreground">${item.product.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.size)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                        className="px-2 py-1 hover:bg-muted transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4 sticky top-20">
              <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {subtotal > 50 && <p className="text-sm text-green-600 font-semibold">✓ Free shipping applied!</p>}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>

              <Link
                href="/shop"
                className="block w-full py-2 px-4 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-center font-semibold"
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
