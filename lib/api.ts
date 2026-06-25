const API_BASE = 'https://test-sandbox-api.onrender.com/api';

// Type definitions
export interface Product {
  id: number;
  title: string;
  author: string;
  year: number;
  genre: string;
  in_stock: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface ApiError {
  error: string;
}

// API Functions
export const api = {
  // Auth
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE}/books/${id}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    return response.json();
  },

  // Reset Database (for testing)
  resetDatabase: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/reset`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to reset database');
    }
    return response.json();
  },

  // Cart operations (using localStorage for now)
  getCart: (): Product[] => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  addToCart: (product: Product): void => {
    const cart = api.getCart();
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  removeFromCart: (productId: number): void => {
    const cart = api.getCart().filter(p => p.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  clearCart: (): void => {
    localStorage.removeItem('cart');
  }
};