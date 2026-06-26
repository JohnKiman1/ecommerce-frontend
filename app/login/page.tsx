'use client'

import Link from 'next/link'
import { AuthForm } from '@/components/AuthForm'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/shop')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <AuthForm mode="login" />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-blue-800 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground/80">
              Test Users: <strong>admin</strong> / <strong>admin123</strong> |{' '}
              <strong>viewer</strong> / <strong>viewer123</strong>
            </p>
            <p className="text-xs text-center text-gray-400 mt-1">
              (locked / locked123 returns a 403 error)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}