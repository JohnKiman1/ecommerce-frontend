// app/admin/products/add/page.tsx
'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'clothing',
    image: '/images/product-1.png',
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL'],
  })

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleFile(file)
      } else {
        setError('Please drop an image file')
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setFormData({ ...formData, image: URL.createObjectURL(file) })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setFormData({ ...formData, image: '/images/product-1.png' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const product = {
        ...formData,
        price: parseFloat(formData.price),
        rating: 0,
        reviews: 0,
      }
      await api.createProduct(product)
      router.push('/admin/products')
    } catch (err) {
      setError('Failed to create product')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Product</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white rounded-lg shadow-sm p-6">
        {/* Image Upload with Drag & Drop */}
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          
          {/* Drag & Drop Zone */}
          <div
            id="image-upload"
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="img"
            aria-label="Drag and drop image upload area"
          >
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="max-h-48 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center" aria-hidden="true">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload product image"
              title="Click to upload an image"
            />
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            id="add-name"
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
          <label htmlFor="add-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="add-description"
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
            <label htmlFor="add-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              id="add-price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              title="Enter the product price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="add-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="add-category"
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

        {/* Sizes */}
        <div>
          <label htmlFor="add-sizes" className="block text-sm font-medium text-gray-700 mb-1">
            Sizes (comma separated)
          </label>
          <input
            id="add-sizes"
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.in_stock}
              onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
              aria-label="Product in stock"
              title="Toggle stock status"
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Product'}
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