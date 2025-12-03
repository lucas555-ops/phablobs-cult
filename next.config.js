/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.phantom.app',
      },
      {
        protocol: 'https',
        hostname: 'api.phantom.app',
      },
    ],
    unoptimized: true,
  },
  // Удалены конфликтующие заголовки - они установлены в vercel.json
}

module.exports = nextConfig
