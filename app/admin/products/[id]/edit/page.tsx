// app/admin/products/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import ImageUpload from '@/components/ImageUpload'
import { Package, ArrowLeft } from 'lucide-react'

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()
  const id = parseInt(params.id)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'clothing',
    image: '',
    in_stock: true,
    sizes: [] as string[],
  })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const product = await api.getProduct(id)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        in_stock: product.in_stock,
        sizes: product.sizes || [],
      })
      setError(null)
    } catch (err) {
      setError('Failed to load product')
      showToast('Failed to load product', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate price
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price')
      showToast('Please enter a valid price', 'error')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const product = {
        ...formData,
        price: parseFloat(formData.price),
      }
      await api.updateProduct(id, product)
      showToast('Product updated successfully! 🎉', 'success')
      router.push('/admin/products')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      setSaving(false)
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
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update product information
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        {/* Product Name */}
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            id="edit-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            title="Enter the product name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the product"
            title="Enter the product description"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              id="edit-price"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              title="Enter the product price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              title="Select a category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="footwear">Footwear</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            label="Product Image"
          />
        </div>

        {/* Sizes */}
        <div>
          <label htmlFor="edit-sizes" className="block text-sm font-medium text-gray-700 mb-1">
            Sizes (comma separated)
          </label>
          <input
            id="edit-sizes"
            type="text"
            value={formData.sizes.join(', ')}
            onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="S, M, L, XL"
            title="Enter sizes separated by commas"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* In Stock */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.in_stock}
              onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              aria-label="Product in stock"
              title="Toggle stock status"
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
          <span className={`text-xs px-2 py-1 rounded-full ${
            formData.in_stock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {formData.in_stock ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
          <a
            href="/admin/products"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}