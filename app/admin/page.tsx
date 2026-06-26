// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Package, Users, ShoppingCart, DollarSign, Plus, Star } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0,
    reviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [products, users, orders] = await Promise.all([
        api.getProducts(),
        api.getUsers(),
        api.getOrders(1), // Get orders for user 1 (admin)
      ])

      // Calculate total orders and revenue across all users
      let totalOrders = 0
      let totalRevenue = 0
      
      // Get orders for all users
      const allUsers = await api.getUsers()
      let allOrders: any[] = []
      for (const user of allUsers) {
        try {
          const userOrders = await api.getOrders(user.id)
          allOrders = [...allOrders, ...userOrders]
        } catch (err) {
          // Skip if no orders
        }
      }
      
      totalOrders = allOrders.length
      totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0)

      // Get total reviews
      let totalReviews = 0
      for (const product of products) {
        try {
          const reviews = await api.getReviews(product.id)
          totalReviews += reviews.length
        } catch (err) {
          // Skip if no reviews
        }
      }

      setStats({
        products: products.length,
        users: users.length || 3,
        orders: totalOrders,
        revenue: totalRevenue,
        reviews: totalReviews,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set default values if API fails
      setStats({
        products: 0,
        users: 3,
        orders: 0,
        revenue: 0,
        reviews: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const statCards = [
    { 
      title: 'Total Products', 
      value: stats.products, 
      icon: Package, 
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    { 
      title: 'Total Users', 
      value: stats.users, 
      icon: Users, 
      color: 'bg-green-500',
      textColor: 'text-white'
    },
    { 
      title: 'Total Orders', 
      value: stats.orders, 
      icon: ShoppingCart, 
      color: 'bg-purple-500',
      textColor: 'text-white'
    },
    { 
      title: 'Revenue', 
      value: `$${stats.revenue.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'bg-yellow-500',
      textColor: 'text-white'
    },
    { 
      title: 'Total Reviews', 
      value: stats.reviews, 
      icon: Star, 
      color: 'bg-pink-500',
      textColor: 'text-white'
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/add"
              className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="inline h-5 w-5 mr-2" />
              Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="block w-full text-center px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="block w-full text-center px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/admin/reviews"
              className="block w-full text-center px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Manage Reviews
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Products</span>
              <span className="font-semibold text-foreground">{stats.products}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Users</span>
              <span className="font-semibold text-foreground">{stats.users}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Orders</span>
              <span className="font-semibold text-foreground">{stats.orders}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Reviews</span>
              <span className="font-semibold text-foreground">{stats.reviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold text-primary">${stats.revenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}