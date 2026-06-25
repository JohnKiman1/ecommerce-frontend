// types/index.ts

// ============ PRODUCT TYPES ============
// Base product type from Supabase
export interface Product {
  id: number                    // BIGSERIAL in Supabase
  title: string                 // Product name
  author: string                // Product author/brand
  year: number                  // Publication year
  genre: string                 // Product category
  in_stock: boolean             // Stock status
  created_at: string            // Timestamp from Supabase
}

// Extended product type for e-commerce display (matches mock data)
export interface ECommerceProduct {
  id: string                    // String ID for mock data
  name: string                  // Product name (maps to title)
  description: string           // Product description
  price: number                 // Product price
  category: string              // Product category (maps to genre)
  image: string                 // Product image URL
  rating: number                // Average rating
  reviews: number               // Number of reviews
  inStock: boolean             // Stock status (camelCase for frontend)
  sizes: string[]              // Available sizes
  created_at?: string           // Optional timestamp
}

// Helper function to convert Product to ECommerceProduct
export function toECommerceProduct(product: Product): ECommerceProduct {
  return {
    id: product.id.toString(),
    name: product.title,
    description: `${product.title} by ${product.author}`,
    price: 0, // Default price, will be overridden by actual data
    category: product.genre,
    image: '/images/placeholder.png',
    rating: 0,
    reviews: 0,
    inStock: product.in_stock,
    sizes: ['One Size'],
    created_at: product.created_at,
  }
}

// ============ CART TYPES ============
export interface CartItem {
  id?: number                   // Optional, from Supabase
  productId: string             // String ID for mock data compatibility
  product: ECommerceProduct     // Full product object for display
  quantity: number
  size?: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// ============ USER TYPES ============
export interface User {
  id: number                   // BIGSERIAL in Supabase
  username: string
  role: 'admin' | 'viewer' | 'locked'
  name?: string
  email?: string
  phone?: string
  addresses?: Address[]
  defaultAddressId?: string
}

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
  category?: string
  minPrice?: number
  maxPrice?: number
}

// ============ SHOPPING CART TYPES ============
export interface CartItemInput {
  productId: string
  quantity: number
  size?: string
}

export interface CartSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

// ============ CHECKOUT TYPES ============
export interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  deliveryDate?: string
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery'
  cardNumber?: string
  cardExpiry?: string
  cardCVC?: string
}

// ============ REVIEW TYPES ============
export interface Review {
  id: number
  productId: number
  userId: number
  rating: number
  comment: string
  username?: string
  created_at: string
}

// ============ API RESPONSE WRAPPER ============
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

// ============ PAGINATION TYPES ============
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationParams & { total: number }
}