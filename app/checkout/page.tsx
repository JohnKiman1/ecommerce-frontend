'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cart, totalPrice, clearCart } = useCart()
  const { showToast } = useToast()
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

  // Safe check for empty cart
  const cartItems = cart || []
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (cartItems.length === 0 && !orderPlaced) {
      router.push('/cart')
    }
  }, [isAuthenticated, router, cartItems.length, orderPlaced])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600">Please sign in to complete your purchase</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Safe empty cart check
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-600">Add some items to your cart before checking out.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue Shopping
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Calculate totals from cart
  const subtotal = totalPrice || 0
  const shipping = subtotal > 100 ? 0 : 9.99
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
      // Create order data
      const orderData = {
        user_id: user?.id,
        items: cartItems.map(item => ({
          productId: item.product_id,
          productName: item.products?.name || 'Product',
          price: item.products?.price || 0,
          quantity: item.quantity,
          size: item.size,
          image: item.products?.image || '/images/placeholder.png',
        })),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        shipping_address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        payment_method: 'credit_card',
        status: 'confirmed',
      }

      // ✅ Save order to database
      const result = await api.createOrder(orderData)
      console.log('✅ Order placed:', result)
      
      setOrderPlaced(true)
      await clearCart()
      showToast('Order placed successfully! 🎉', 'success')
    } catch (error) {
      console.error('❌ Order error:', error)
      showToast('Failed to place order. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed! 🎉</h1>
          <p className="text-gray-600">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Back to Home
            </Link>
            {/* ✅ View Orders button redirects to profile with orders tab */}
            <Link
              href="/profile?tab=orders"
              className="block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-8">
              {(['shipping', 'billing', 'payment', 'confirm'] as const).map((s, i) => (
                <div key={s} className="flex-1">
                  <div
                    className={`p-3 rounded-lg text-center font-semibold text-sm transition-colors ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : ['shipping', 'billing', 'payment'].includes(s) && 
                          ['shipping', 'billing', 'payment', 'confirm'].indexOf(s) <
                          ['shipping', 'billing', 'payment', 'confirm'].indexOf(step)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping */}
            {step === 'shipping' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter your email address"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter your street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter your city"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter your state"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter your ZIP code"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                {Object.entries(errors).map(([field, error]) => (
                  <p key={field} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Continue to Billing
                </button>
              </div>
            )}

            {/* Billing */}
            {step === 'billing' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                <p className="text-gray-600">Same as shipping address</p>
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    name="cardName"
                    placeholder="Cardholder Name"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter the cardholder name"
                  />
                </div>
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter your card number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      id="cardExpiry"
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter the expiry date (MM/YY)"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
                      CVC *
                    </label>
                    <input
                      id="cardCVC"
                      type="text"
                      name="cardCVC"
                      placeholder="CVC"
                      value={formData.cardCVC}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      title="Enter the CVC code"
                    />
                  </div>
                </div>
                {Object.entries(errors).map(([field, error]) => (
                  <p key={field} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
                <button
                  onClick={handleNext}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Review Order
                </button>
              </div>
            )}

            {/* Confirm */}
            {step === 'confirm' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                <p className="text-gray-600">Please review your order details before completing the purchase.</p>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping To:</h3>
                  <p className="text-sm text-gray-600">
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
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center gap-2"
                  title="Place your order"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.quantity}x {item.products?.name || 'Product'}
                    <div className="text-gray-900 font-semibold">${((item.products?.price || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {subtotal > 100 && <p className="text-sm text-green-600 font-semibold">✓ Free shipping applied!</p>}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ Main page component with Suspense boundary (for future useSearchParams compatibility)
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}