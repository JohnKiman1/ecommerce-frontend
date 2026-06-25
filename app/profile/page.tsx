'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'addresses' | 'orders'>('profile')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(['profile', 'addresses', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
                tab === t ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Welcome,</p>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-6">
              <div>
                <label className="text-sm text-muted-foreground">Email Address</label>
                <p className="text-lg font-semibold text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <p className="text-lg font-semibold text-foreground">{user.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {tab === 'addresses' && (
          <div className="space-y-4">
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((address, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground capitalize">{address.type}</h3>
                    </div>
                    {address.isDefault && (
                      <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <p className="text-muted-foreground mb-4">No addresses saved yet</p>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Add Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet</p>
            <a
              href="/shop"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Start Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
