'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag, LogOut, User } from 'lucide-react'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { cartItemsCount } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg"></div>
            <span className="text-xl font-bold text-primary hidden sm:inline">StyleHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-foreground hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                  title="View Profile"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-foreground hover:text-destructive transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                <span className="hidden sm:inline text-sm">Sign In</span>
                <User className="h-5 w-5 sm:hidden" />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center text-foreground hover:text-primary transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
