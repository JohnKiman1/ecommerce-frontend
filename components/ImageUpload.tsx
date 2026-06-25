// components/ImageUpload.tsx
'use client'

import { useState, useRef, DragEvent } from 'react'
import { X, Upload } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string, file?: File) => void
  label?: string
  required?: boolean
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = 'Product Image',
  required = false 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        processFile(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    setFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
      onChange(dataUrl, file)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setPreview(null)
    setFile(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <label htmlFor="image-upload-input" className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        aria-label={`${label} upload area - drag and drop or click to select`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Product image preview"
              className="max-h-48 rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeImage()
              }}
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
              <Upload className="h-12 w-12 text-gray-400" />
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
          id="image-upload-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          aria-label={`Upload ${label}`}
          title={`Click to upload ${label}`}
        />
      </div>
      {preview && (
        <p className="text-xs text-gray-500 mt-1">
          Image uploaded successfully. Click the X to remove.
        </p>
      )}
    </div>
  )
}