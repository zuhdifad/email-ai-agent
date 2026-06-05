/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
