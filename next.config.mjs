/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.scdn.co" },
    ],
  },
}

export default nextConfig
