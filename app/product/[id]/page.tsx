// app/product/[id]/page.tsx
import { api } from '@/lib/api'
import ProductDetailClient from './ProductDetailClient'
import { MOCK_PRODUCTS } from '@/lib/mockData'

// Generate static paths for all products
export async function generateStaticParams() {
  try {
    // Try to fetch from API first
    const products = await api.getProducts()
    return products.map((product) => ({
      id: product.id.toString(), // This generates /product/1, /product/2, etc.
    }))
  } catch (error) {
    console.error('Failed to fetch products from API, using mock data:', error)
    // Fallback to mock data if API fails
    return MOCK_PRODUCTS.map((product) => ({
      id: product.id.replace('p', ''), // Convert 'p1' → '1'
    }))
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />
}