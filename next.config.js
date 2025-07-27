/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['statics.topai.tools'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig 