/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    unoptimized: false
  },
  // swcMinify: true,
  output: 'standalone',
  compress: true,
}

module.exports = nextConfig
