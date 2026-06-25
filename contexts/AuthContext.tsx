// contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('[v0] Failed to parse saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  // LOGIN - Integrated with your backend API
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      const response = await api.login(username, password)
      
      // Store user in state and localStorage
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // REGISTER - Placeholder (your backend doesn't have registration yet)
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!name || !email || !password) {
        throw new Error('All fields are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // ⚠️ Note: Your backend doesn't have a registration endpoint yet
      // This is a placeholder that simulates registration
      // To fully implement, you'd need to add a POST /api/register endpoint
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create mock user (since no real registration yet)
      const mockUser: User = {
        id: Date.now(),
        username: name.toLowerCase().replace(/\s/g, '_'),
        role: 'viewer',
      }

      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))

      console.warn('⚠️ Registration is using mock data. Add /api/register endpoint for production.')
      
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // LOGOUT - Clear user state
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // UPDATE USER - Update user data
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}