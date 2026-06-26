// components/Header.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag, LogOut, User, Menu } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle' 

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SH</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">StyleHub</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Shop
            </Link>
            <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground/80 hover:text-foreground"
              aria-label="Toggle menu"
              title="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
                  title="View Profile"
                  aria-label="View Profile"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">{user?.name || user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-foreground/80 hover:text-destructive transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-foreground/80 hover:text-primary transition-colors">
                <span className="hidden sm:inline text-sm font-medium">Sign In</span>
                <User className="h-5 w-5 sm:hidden" />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center text-foreground/80 hover:text-primary transition-colors"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-3">
            <Link
              href="/shop"
              className="block text-foreground/80 hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block text-foreground/80 hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-foreground/80 hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-border">
              <ThemeToggle />
            </div>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="block text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}