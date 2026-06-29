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
import Reviews from '@/components/Reviews'

interface ProductDetailClientProps {
  productId: string
  autoOpenReview?: boolean
}

export default function ProductDetailClient({
  productId,
  autoOpenReview = false
}: ProductDetailClientProps) {
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

        if (!productId) {
          console.error('Product ID is undefined or null')
          setLoading(false)
          return
        }

        let numericId: number
        if (productId.startsWith('p')) {
          numericId = parseInt(productId.substring(1))
        } else {
          numericId = parseInt(productId)
        }

        if (isNaN(numericId)) {
          console.error('Invalid product ID:', productId)
          setLoading(false)
          return
        }

        const data = await api.getProduct(numericId)
        setProduct(data)
        setSelectedSize(data.sizes?.[0])

        const allProducts = await api.getProducts()
        const related = allProducts.filter(
          (p) => p.category === data.category && p.id !== data.id
        ).slice(0, 4)
        setRelatedProducts(related)

      } catch (error) {
        console.error('Failed to fetch product from API:', error)

        if (productId) {
          const mockProduct = getProductById(productId)
          if (mockProduct) {
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Product not found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Product */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-card rounded-lg p-6 shadow-sm border border-border">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-lg bg-secondary overflow-hidden">
              <Image
                src={product.image || '/images/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.description}</p>
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
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 0} rating ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Price</span>
              <p className="text-4xl font-bold text-primary">${(product.price || 0).toFixed(2)}</p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Availability</span>
              <p className={`font-semibold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Size</span>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary hover:bg-muted text-foreground'
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
              <span className="text-sm font-semibold text-muted-foreground uppercase">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart - Fixed button text */}
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Product Details */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Shipping</h3>
                <p className="text-sm text-muted-foreground">Free shipping on orders over $50. Delivery in 3-5 business days.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy. No questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
          <Reviews
            productId={product.id}
            productName={product.name}
            autoOpen={autoOpenReview}
          />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
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