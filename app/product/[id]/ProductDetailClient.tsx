// app/product/[id]/ProductDetailClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, ArrowLeft, ShoppingBag } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'
import { api, Product } from '@/lib/api'
import { getProductById, MOCK_PRODUCTS } from '@/lib/mockData'

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter()
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>('')
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // ✅ Convert 'p16' to 16, or use as-is if it's a number
        let numericId: number
        if (productId.startsWith('p')) {
          numericId = parseInt(productId.substring(1))
        } else {
          numericId = parseInt(productId)
        }
        
        // Check if the ID is valid
        if (isNaN(numericId)) {
          console.error('Invalid product ID:', productId)
          setLoading(false)
          return
        }
        
        // Fetch from API
        const data = await api.getProduct(numericId)
        setProduct(data)
        setSelectedSize(data.sizes?.[0])
        
        // Fetch related products (same category)
        const allProducts = await api.getProducts()
        const related = allProducts.filter(
          (p) => p.category === data.category && p.id !== data.id
        ).slice(0, 4)
        setRelatedProducts(related)
        
      } catch (error) {
        console.error('Failed to fetch product from API:', error)
        
        // ✅ Fallback to mock data if API fails
        const mockProduct = getProductById(productId)
        if (mockProduct) {
          // Convert mock product to API product format
          const convertedProduct: Product = {
            id: parseInt(mockProduct.id.replace('p', '')),
            name: mockProduct.name,
            description: mockProduct.description,
            price: mockProduct.price,
            category: mockProduct.category,
            image: mockProduct.image,
            rating: mockProduct.rating,
            reviews: mockProduct.reviews,
            in_stock: mockProduct.inStock,
            sizes: mockProduct.sizes,
            created_at: new Date().toISOString(),
          }
          setProduct(convertedProduct)
          setSelectedSize(convertedProduct.sizes?.[0])
          
          // Also fetch related products from mock data
          const allMockProducts = MOCK_PRODUCTS
          const related = allMockProducts
            .filter((p) => p.category === mockProduct.category && p.id !== mockProduct.id)
            .slice(0, 4)
            .map((p) => ({
              id: parseInt(p.id.replace('p', '')),
              name: p.name,
              description: p.description,
              price: p.price,
              category: p.category,
              image: p.image,
              rating: p.rating,
              reviews: p.reviews,
              in_stock: p.inStock,
              sizes: p.sizes,
              created_at: new Date().toISOString(),
            }))
          setRelatedProducts(related)
        } else {
          console.error('Product not found in mock data:', productId)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product.id, quantity, selectedSize)
    addNotification(`Added ${quantity}x ${product.name} to cart`, 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Product */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-lg p-6 shadow-sm">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-lg bg-gray-100 overflow-hidden">
              <Image
                src={product.image || '/images/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 0) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 0} rating ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-gray-600 uppercase">Price</span>
              <p className="text-4xl font-bold text-blue-600">${(product.price || 0).toFixed(2)}</p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-gray-600 uppercase">Availability</span>
              <p className={`font-semibold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-600 uppercase">Size</span>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 hover:border-blue-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-gray-600 uppercase">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
                <p className="text-sm text-gray-600">Free shipping on orders over $50. Delivery in 3-5 business days.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy. No questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}