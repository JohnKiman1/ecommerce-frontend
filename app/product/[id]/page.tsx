'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Star, ArrowLeft, ShoppingBag } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { getProductById, MOCK_PRODUCTS } from '@/lib/mockData'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const product = getProductById(params.id as string)
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Product not found</h1>
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

  const relatedProducts = MOCK_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    4
  )

  const handleAddToCart = () => {
    addItem(product.id, quantity, selectedSize)
    addNotification(`Added ${quantity}x ${product.name} to cart`, 'success')
  }

  return (
    <div className="min-h-screen">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-lg bg-muted overflow-hidden">
              <Image
                src={product.image}
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-primary text-primary' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} rating ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Price</span>
              <p className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Availability</span>
              <p className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-destructive'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && (
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
                          : 'border-border hover:border-primary'
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
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
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
