// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-frontend-api.onrender.com/api';

export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  in_stock: boolean;
  sizes: string[];
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  size: string;
  products: Product;
  added_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: any;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: any[];
}

export const api = {
  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  
  login: async (username: string, password: string) => {
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

  register: async (username: string, password: string, email: string, name: string) => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, name })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  // ============================================
  // PRODUCT ENDPOINTS
  // ============================================

  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    return response.json();
  },

  createProduct: async (product: any): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }
    return response.json();
  },

  updateProduct: async (id: number, product: any): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }
    return response.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
  },

  // ============================================
  // CART ENDPOINTS
  // ============================================

  getCart: async (userId: number): Promise<CartItem[]> => {
    const response = await fetch(`${API_BASE}/cart/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    return response.json();
  },

  addToCart: async (userId: number, productId: number, quantity: number = 1, size?: string) => {
    const response = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: productId, quantity, size })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to cart');
    }
    return response.json();
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update cart');
    }
    return response.json();
  },

  removeFromCart: async (itemId: number) => {
    const response = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from cart');
    }
    return response.json();
  },

  clearCart: async (userId: number) => {
    const response = await fetch(`${API_BASE}/cart/user/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear cart');
    }
    return response.json();
  },

  // ============================================
  // ORDER ENDPOINTS
  // ============================================

  createOrder: async (orderData: any) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    return response.json();
  },

  getOrders: async (userId: number): Promise<Order[]> => {
    const response = await fetch(`${API_BASE}/orders/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  getOrder: async (userId: number, orderId: number): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders/${userId}/${orderId}`);
    if (!response.ok) {
      throw new Error('Order not found');
    }
    return response.json();
  },

  // ✅ ADD THIS: Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update order status');
    }
    return response.json();
  },

  // ============================================
  // REVIEW ENDPOINTS
  // ============================================

  createReview: async (productId: number, data: { rating: number; comment: string }) => {
    const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 1, // This should come from auth context
        rating: data.rating,
        comment: data.comment
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit review');
    }
    return response.json();
  },

  getReviews: async (productId: number) => {
    const response = await fetch(`${API_BASE}/products/${productId}/reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  },

  // ============================================
  // USER PROFILE ENDPOINTS
  // ============================================

  getProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE}/profile/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  updateProfile: async (userId: number, data: { email?: string; name?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE}/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
  },

  // ============================================
  // USER MANAGEMENT ENDPOINTS (Admin Only)
  // ============================================

  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  getUser: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/${id}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    return response.json();
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user role');
    }
    return response.json();
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  resetDatabase: async () => {
    const response = await fetch(`${API_BASE}/reset`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to reset database');
    }
    return response.json();
  }
}; 