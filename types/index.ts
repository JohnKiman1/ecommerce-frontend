// types/index.ts

// ============ PRODUCT TYPES ============
// This matches your Supabase 'books' table structure
export interface Product {
  id: number                    // BIGSERIAL in Supabase
  title: string                 // Product name (was 'name')
  author: string                // Product author/brand (was 'author')
  year: number                  // Publication year (used as a numeric field)
  genre: string                 // Product category (was 'category')
  in_stock: boolean            // Stock status (was 'inStock')
  created_at: string           // Timestamp from Supabase
}

// Extended product type for display purposes
export interface ProductDisplay extends Product {
  // Computed fields for UI
  price?: number               // Optional - for e-commerce display
  rating?: number              // Optional - for e-commerce display
  reviews?: number             // Optional - for e-commerce display
  image?: string               // Optional - for e-commerce display
  description?: string         // Optional - for e-commerce display
}

// ============ CART TYPES ============
export interface CartItem {
  productId: number            // Changed from string to number (matches Product.id)
  product: Product             // Full product object for easy display
  quantity: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
}

// ============ USER TYPES ============
// This matches your Supabase 'users' table structure
export interface User {
  id: number                   // BIGSERIAL in Supabase
  username: string             // Changed from 'email' to 'username'
  role: 'admin' | 'viewer' | 'locked'  // Role-based access
  // Additional user fields (currently not in Supabase)
  name?: string                // Optional - not in your current schema
  email?: string               // Optional - not in your current schema
  phone?: string               // Optional - not in your current schema
  addresses?: Address[]        // Optional - not in your current schema
  defaultAddressId?: string    // Optional - not in your current schema
}

// Address type - not currently in your backend, but kept for future use
export interface Address {
  id: string
  type: 'billing' | 'shipping'
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

// ============ ORDER TYPES ============
// Not currently in your backend, kept for future e-commerce features
export interface Order {
  id: string
  userId: number
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: Address
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
  image?: string
}

// ============ AUTH TYPES ============
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============ NOTIFICATION TYPES ============
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

// ============ API RESPONSE TYPES ============
export interface LoginResponse {
  message: string
  user: User
}

export interface ApiError {
  error: string
}

// ============ PRODUCT FILTERS ============
export interface ProductFilters {
  genre?: string
  in_stock?: boolean
  search?: string
  sortBy?: 'title' | 'year' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}