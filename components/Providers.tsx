// components/Providers.tsx
'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationToast } from './NotificationToast'
import { Header } from './Header'
import { Footer } from './Footer'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <NotificationToast />
          </div>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}