// app/admin/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api, Product } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Pencil, Trash2, Plus, Search, Package, AlertCircle } from 'lucide-react'

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await api.getProducts()
      setProducts(data)
      setFilteredProducts(data)
      setError(null)
    } catch (err) {
      setError('Failed to load products')
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    setDeletingId(id)
    try {
      await api.deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
      showToast('Product deleted successfully!', 'success')
    } catch (err) {
      showToast('Failed to delete product. Please try again.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="search-products"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            title="Search products by name or category"
            aria-label="Search products"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-xl font-bold text-gray-900">
                {products.filter(p => p.in_stock).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-xl font-bold text-gray-900">
                {products.filter(p => !p.in_stock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.in_stock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label={`Edit ${product.name}`}
                        title={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        aria-label={`Delete ${product.name}`}
                        title={`Delete ${product.name}`}
                      >
                        {deletingId === product.id ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}