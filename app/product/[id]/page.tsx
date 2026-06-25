// app/product/[id]/page.tsx
import { api } from '@/lib/api'
import ProductDetailClient from './ProductDetailClient'

export async function generateStaticParams() {
  try {
    const products = await api.getProducts()
    console.log('✅ Generating static pages for:', products.length, 'products')
    
    return products.map((product) => ({
      id: product.id.toString(),
    }))
  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    // Return empty array - products will be fetched on client side
    return []
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />
}