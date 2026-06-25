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
    return []
  }
}

// ✅ Fix: Properly handle params as a Promise
export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  return <ProductDetailClient productId={id} />
}