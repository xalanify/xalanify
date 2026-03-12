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
  async headers() {
    return [
      // Critical: service worker must be fetched fresh, otherwise PWA stays stuck.
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
        ],
      },
      // Safer to keep manifest fresh too (icons/metadata changes).
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
