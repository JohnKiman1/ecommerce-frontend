// app/admin/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api, Product } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Pencil, Trash2, Plus, Search, Package, AlertCircle, X } from 'lucide-react'

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [productNameToDelete, setProductNameToDelete] = useState('')

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

  // Open confirmation dialog
  const confirmDelete = (id: number, name: string) => {
    setProductToDelete(id)
    setProductNameToDelete(name)
    setShowConfirmDialog(true)
  }

  // Close confirmation dialog
  const cancelDelete = () => {
    setShowConfirmDialog(false)
    setProductToDelete(null)
    setProductNameToDelete('')
  }

  // Execute delete
  const handleDelete = async () => {
    if (!productToDelete) return
    
    setDeletingId(productToDelete)
    setShowConfirmDialog(false)
    
    try {
      await api.deleteProduct(productToDelete)
      setProducts(products.filter((p) => p.id !== productToDelete))
      showToast(`"${productNameToDelete}" deleted successfully!`, 'success')
    } catch (err) {
      showToast('Failed to delete product. Please try again.', 'error')
    } finally {
      setDeletingId(null)
      setProductToDelete(null)
      setProductNameToDelete('')
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
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Confirm Delete</h3>
              <button
                onClick={cancelDelete}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground/80" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-muted-foreground">
                Are you sure you want to delete <strong>"{productNameToDelete}"</strong>?
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-foreground/80 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
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
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground/80">Total Products</p>
              <p className="text-xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground/80">In Stock</p>
              <p className="text-xl font-bold text-foreground">
                {products.filter(p => p.in_stock).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground/80">Out of Stock</p>
              <p className="text-xl font-bold text-foreground">
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

      {/* Products Table */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-foreground">${product.price.toFixed(2)}</td>
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
                        className="text-primary hover:text-blue-800 transition-colors"
                        aria-label={`Edit ${product.name}`}
                        title={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => confirmDelete(product.id, product.name)}
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
            <p className="text-muted-foreground/80">No products found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:text-blue-800 text-sm"
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