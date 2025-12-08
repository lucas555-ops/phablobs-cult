/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Важно: настройки asyncWebAssembly должны быть только для серверной сборки
    if (isServer) {
      config.experiments = {
        asyncWebAssembly: true,
        layers: true,
      }
      
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    }
    return config
  },
}

module.exports = nextConfig
