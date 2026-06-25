'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'
import { getProductById } from '@/lib/mockData'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cart, clearCart } = useCart()
  const { addNotification } = useNotification()
  const [step, setStep] = useState<'shipping' | 'billing' | 'payment' | 'confirm'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-foreground">Sign in required</h1>
          <p className="text-muted-foreground">Please sign in to complete your purchase</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-foreground">Your cart is empty</h1>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 'shipping') {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.address) newErrors.address = 'Address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.state) newErrors.state = 'State is required'
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    } else if (step === 'payment') {
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required'
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required'
      if (!formData.cardCVC) newErrors.cardCVC = 'CVC is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return

    if (step === 'shipping') setStep('billing')
    else if (step === 'billing') setStep('payment')
    else if (step === 'payment') setStep('confirm')
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setOrderPlaced(true)
      clearCart()
      addNotification('Order placed successfully!', 'success')
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Back to Home
            </Link>
            <Link
              href="/profile"
              className="block px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-semibold"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            <div className="flex gap-4 mb-8">
              {(['shipping', 'billing', 'payment', 'confirm'] as const).map((s, i) => (
                <div key={s} className="flex-1">
                  <div
                    className={`p-3 rounded-lg text-center font-semibold transition-colors ${
                      step === s
                        ? 'bg-primary text-primary-foreground'
                        : ['shipping', 'billing', 'payment'].includes(s) && ['shipping', 'billing', 'payment', 'confirm'].indexOf(s) <
                          ['shipping', 'billing', 'payment', 'confirm'].indexOf(step)
                        ? 'bg-green-100 text-green-900'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping */}
            {step === 'shipping' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                {Object.entries(errors).map(([field, error]) => (
                  <p key={field} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Continue to Billing
                </button>
              </div>
            )}

            {/* Billing */}
            {step === 'billing' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Billing Address</h2>
                <p className="text-sm text-muted-foreground">Same as shipping address</p>
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
                <input
                  type="text"
                  name="cardName"
                  placeholder="Cardholder Name"
                  value={formData.cardName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number (demo: 4242 4242 4242 4242)"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="cardExpiry"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="cardCVC"
                    placeholder="CVC"
                    value={formData.cardCVC}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                {Object.entries(errors).map(([field, error]) => (
                  <p key={field} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Review Order
                </button>
              </div>
            )}

            {/* Confirm */}
            {step === 'confirm' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Confirm Order</h2>
                <p className="text-muted-foreground">Please review your order details before completing the purchase.</p>
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-foreground mb-3">Shipping To:</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.firstName} {formData.lastName}
                    <br />
                    {formData.address}
                    <br />
                    {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4 sticky top-20">
              <h2 className="text-lg font-bold text-foreground">Order Summary</h2>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cartItemsWithDetails.map((item) =>
                  item && item.product ? (
                    <div key={`${item.product.id}-${item.size}`} className="text-sm text-muted-foreground">
                      {item.quantity}x {item.product.name}
                      <div className="text-foreground font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ) : null
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
