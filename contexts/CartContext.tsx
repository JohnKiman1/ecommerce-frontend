// contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Product, CartItem } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (productId: number, quantity: number, size?: string) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await api.getCart(user.id);
      // ✅ Ensure data is always an array
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]); // ✅ Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: number, quantity: number = 1, size?: string) => {
    if (!user) return;
    try {
      await api.addToCart(user.id, productId, quantity, size);
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.clearCart(user.id);
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  // ✅ Safe calculations with fallback for undefined cart
  const totalItems = Array.isArray(cart) 
    ? cart.reduce((sum, item) => sum + (item?.quantity || 0), 0) 
    : 0;
  
  const totalPrice = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        const price = item?.products?.price || 0;
        const quantity = item?.quantity || 0;
        return sum + price * quantity;
      }, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart: cart || [], // ✅ Always return an array
        totalItems,
        totalPrice,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}