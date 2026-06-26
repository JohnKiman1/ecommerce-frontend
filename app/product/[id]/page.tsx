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

export default async function ProductPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ rate?: string }>
}) {
  const { id } = await params
  const { rate } = await searchParams
  
  return <ProductDetailClient productId={id} autoOpenReview={rate === 'true'} />
}