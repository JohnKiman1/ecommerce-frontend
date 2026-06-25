// app/product/[id]/page.tsx
import { MOCK_PRODUCTS } from '@/lib/mockData'
import ProductDetailClient from './ProductDetailClient'

// Generate static paths using mock data (no API call during build)
export async function generateStaticParams() {
  // Use mock data directly - no API call during build
  return MOCK_PRODUCTS.map((product) => ({
    id: product.id.toString(),
  }))
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />
}