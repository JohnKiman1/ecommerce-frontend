/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // Don't fail the build if generateStaticParams fails
  experimental: {
    // This allows the build to continue if some paths fail
  },
}

export default nextConfig