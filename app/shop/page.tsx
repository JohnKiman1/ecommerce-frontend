'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES, PRICE_RANGES, filterProducts } from '@/lib/mockData'
import { X } from 'lucide-react'

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest')

  const filtered = useMemo(() => {
    const priceRangeObj = selectedPriceRange
      ? PRICE_RANGES.find((r) => r.id === selectedPriceRange)
      : undefined

    return filterProducts(MOCK_PRODUCTS, {
      category: selectedCategory || undefined,
      priceRange: priceRangeObj ? { min: priceRangeObj.min, max: priceRangeObj.max } : undefined,
      searchQuery,
      sortBy,
    })
  }, [selectedCategory, selectedPriceRange, searchQuery, sortBy])

  const hasActiveFilters = selectedCategory || selectedPriceRange || searchQuery

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Shop</h1>
          <p className="text-muted-foreground">Browse our collection of premium products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="space-y-6 sticky top-20">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Category</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    All Products
                  </button>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        {cat.name}
                        <span className="text-xs opacity-75">{cat.count}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Price</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedPriceRange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedPriceRange ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    All Prices
                  </button>
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedPriceRange === range.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedPriceRange('')
                    setSortBy('newest')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products */}
          <main className="md:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {MOCK_PRODUCTS.length} products
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedPriceRange('')
                  }}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Clear filters and try again
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
