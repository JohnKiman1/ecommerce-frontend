// lib/mockData.ts
import type { ECommerceProduct } from '@/types'

export const MOCK_PRODUCTS: ECommerceProduct[] = [
  {
    id: 'p1',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable everyday t-shirt made from premium 100% cotton. Available in multiple colors.',
    price: 49.99,
    category: 'clothing',
    image: '/images/product-1.png',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p2',
    name: 'Minimal Leather Wallet',
    description: 'Sleek and compact leather wallet with RFID protection. Perfect for everyday carry.',
    price: 79.99,
    category: 'accessories',
    image: '/images/product-2.png',
    rating: 4.8,
    reviews: 256,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p3',
    name: 'Classic White Sneakers',
    description: 'Timeless white sneakers with cushioned sole. Goes with everything in your wardrobe.',
    price: 119.99,
    category: 'footwear',
    image: '/images/product-3.png',
    rating: 4.6,
    reviews: 342,
    inStock: true,
    sizes: ['5', '6', '7', '8', '9', '10', '11', '12', '13'],
  },
  {
    id: 'p4',
    name: 'Stainless Steel Watch',
    description: 'Elegant minimalist watch with precision movement. Water resistant up to 50m.',
    price: 199.99,
    category: 'accessories',
    image: '/images/product-4.png',
    rating: 4.7,
    reviews: 189,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p5',
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit denim with stretch fabric for maximum comfort. Versatile dark blue wash.',
    price: 89.99,
    category: 'clothing',
    image: '/images/product-5.png',
    rating: 4.4,
    reviews: 214,
    inStock: true,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
  },
  {
    id: 'p6',
    name: 'Canvas Tote Bag',
    description: 'Spacious and durable canvas tote bag. Perfect for shopping, work, or travel.',
    price: 59.99,
    category: 'accessories',
    image: '/images/product-6.png',
    rating: 4.5,
    reviews: 176,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p7',
    name: 'Wool Crew Neck Sweater',
    description: 'Warm and comfortable wool sweater. Timeless design in neutral colors.',
    price: 129.99,
    category: 'clothing',
    image: '/images/product-7.png',
    rating: 4.6,
    reviews: 145,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 'p8',
    name: 'Leather Belt',
    description: 'Premium leather belt with minimalist buckle. Fits perfectly with casual or formal wear.',
    price: 69.99,
    category: 'accessories',
    image: '/images/product-8.png',
    rating: 4.5,
    reviews: 98,
    inStock: true,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
  },
  {
    id: 'p9',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning. Built for performance and comfort.',
    price: 139.99,
    category: 'footwear',
    image: '/images/product-9.png',
    rating: 4.7,
    reviews: 267,
    inStock: true,
    sizes: ['5', '6', '7', '8', '9', '10', '11', '12', '13'],
  },
  {
    id: 'p10',
    name: 'Henley Shirt',
    description: 'Classic henley shirt with comfortable fit. Perfect layering piece for any season.',
    price: 54.99,
    category: 'clothing',
    image: '/images/product-10.png',
    rating: 4.4,
    reviews: 134,
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p11',
    name: 'Sunglasses',
    description: 'UV protection sunglasses with polarized lenses. Stylish and protective.',
    price: 149.99,
    category: 'accessories',
    image: '/images/product-11.png',
    rating: 4.6,
    reviews: 203,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p12',
    name: 'Bamboo Water Bottle',
    description: 'Eco-friendly water bottle with bamboo exterior. Keeps drinks cold for 24 hours.',
    price: 44.99,
    category: 'lifestyle',
    image: '/images/product-12.png',
    rating: 4.5,
    reviews: 287,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p13',
    name: 'Chelsea Boots',
    description: 'Versatile Chelsea boots in rich brown. Suitable for casual or dressier occasions.',
    price: 179.99,
    category: 'footwear',
    image: '/images/product-13.png',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    sizes: ['5', '6', '7', '8', '9', '10', '11', '12'],
  },
  {
    id: 'p14',
    name: 'Scarf',
    description: 'Lightweight and versatile scarf. Perfect for any outfit and season.',
    price: 39.99,
    category: 'accessories',
    image: '/images/product-14.png',
    rating: 4.3,
    reviews: 89,
    inStock: true,
    sizes: ['One Size'],
  },
  {
    id: 'p15',
    name: 'Bamboo Cutting Board',
    description: 'Large eco-friendly bamboo cutting board. Perfect for meal preparation and serving.',
    price: 34.99,
    category: 'lifestyle',
    image: '/images/product-15.png',
    rating: 4.5,
    reviews: 167,
    inStock: true,
    sizes: ['One Size'],
  },
]

export const PRODUCT_CATEGORIES = [
  { id: 'clothing', name: 'Clothing', count: 4 },
  { id: 'accessories', name: 'Accessories', count: 6 },
  { id: 'footwear', name: 'Footwear', count: 3 },
  { id: 'lifestyle', name: 'Lifestyle', count: 2 },
]

export const PRICE_RANGES = [
  { id: 'under-50', name: 'Under $50', min: 0, max: 50 },
  { id: '50-100', name: '$50 - $100', min: 50, max: 100 },
  { id: '100-150', name: '$100 - $150', min: 100, max: 150 },
  { id: 'over-150', name: 'Over $150', min: 150, max: Infinity },
]

export function getProductById(id: string): ECommerceProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}

export function filterProducts(
  products: ECommerceProduct[],
  {
    category,
    priceRange,
    searchQuery,
    sortBy,
  }: {
    category?: string
    priceRange?: { min: number; max: number }
    searchQuery?: string
    sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating'
  } = {}
): ECommerceProduct[] {
  let filtered = [...products]

  if (category) {
    filtered = filtered.filter((p) => p.category === category)
  }

  if (priceRange) {
    filtered = filtered.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    )
  }

  if (sortBy) {
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
      default:
        // Keep original order
        break
    }
  }

  return filtered
}