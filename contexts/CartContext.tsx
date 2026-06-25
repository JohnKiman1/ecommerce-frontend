'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Cart, CartItem } from '@/types'

interface CartContextType {
  cart: Cart
  addItem: (productId: string, quantity: number, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
  cartTotal: number
  cartItemsCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Mock product prices for calculating cart total
const productPrices: Record<string, number> = {}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('[v0] Failed to parse saved cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addItem = (productId: string, quantity: number, size?: string) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.productId === productId && item.size === size)

      let updatedItems: CartItem[]
      if (existingItem) {
        updatedItems = prev.items.map((item) =>
          item.productId === productId && item.size === size ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        updatedItems = [...prev.items, { productId, quantity, size }]
      }

      return { ...prev, items: updatedItems }
    })
  }

  const removeItem = (productId: string, size?: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !(item.productId === productId && item.size === size)),
    }))
  }

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item
      ),
    }))
  }

  const clearCart = () => {
    setCart({ items: [], total: 0 })
  }

  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartTotal: cart.total,
        cartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
