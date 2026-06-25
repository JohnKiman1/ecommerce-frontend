'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addNotification } = useNotification()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product.id, 1)
    addNotification(`${product.name} added to cart`, 'success')
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg bg-muted mb-4 aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? 'fill-primary text-primary' : 'text-muted'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
