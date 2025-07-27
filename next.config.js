/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['statics.topai.tools'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig 