/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/slider',
        permanent: true,
      }
    ]
  }
}
const nextTranslate = require('next-translate')

module.exports = nextTranslate(nextConfig)
