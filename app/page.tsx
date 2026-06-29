// app/page.tsx
'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { MOCK_PRODUCTS } from '@/lib/mockData'
import { ArrowRight } from 'lucide-react'
import Newsletter from '@/components/Newsletter'

export default function HomePage() {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 8)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Discover Premium Style
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Carefully curated products for the modern lifestyle. Quality, design, and affordability in every piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground/80 rounded-lg hover:bg-muted transition-colors font-semibold"
              >
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Clothing', slug: 'clothing' },
              { name: 'Accessories', slug: 'accessories' },
              { name: 'Footwear', slug: 'footwear' },
              { name: 'Lifestyle', slug: 'lifestyle' },
            ].map((category) => (
              <Link key={category.slug} href={`/shop?category=${category.slug}`}>
                <div className="p-6 rounded-lg border border-border hover:border-primary hover:bg-muted transition-all cursor-pointer text-center">
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Products</h2>
            <Link href="/shop" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: parseInt(product.id.replace('p', '')),
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  category: product.category,
                  image: product.image,
                  rating: product.rating,
                  reviews: product.reviews,
                  in_stock: product.inStock,
                  sizes: product.sizes || [],
                  created_at: new Date().toISOString(),
                }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Newsletter Section - Using isolated component */}
      <Newsletter />
    </div>
  )
}