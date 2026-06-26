'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding) return
    
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      addNotification(`${product.name} added to cart`, 'success')
    } catch (error) {
      addNotification('Failed to add to cart', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  // ✅ Convert numeric ID to 'p' format for the link
  const productLink = `/product/${product.id}`

  return (
    <Link href={productLink}>
      <div className="group cursor-pointer">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4 aspect-square">
          <Image
            src={product.image || '/images/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews || 0})</span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-lg text-gray-900">
              ${(product.price || 0).toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || isAdding}
              className={`p-2 rounded-lg transition-colors ${
                product.in_stock && !isAdding
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdding ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}