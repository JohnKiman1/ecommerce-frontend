// components/Newsletter.tsx
'use client'

import { useEffect, useState } from 'react'

export default function Newsletter() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render during SSR to avoid hydration issues
  if (!mounted) {
    return (
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Newsletter Signup</h2>
            <p className="text-lg opacity-90">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Newsletter Signup</h2>
          <p className="text-lg opacity-90">Subscribe to get exclusive offers and updates on new arrivals.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Email address"
              title="Enter your email address"
            />
            <button className="px-6 py-2 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 transition-colors font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}