/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar warnings durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimizaciones de compilación
  compiler: {
    // Elimina console.logs en producción (no afecta desarrollo)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimizaciones experimentales seguras
  experimental: {
    // Optimiza CSS automáticamente
    optimizeCss: true,
    // Mejora la carga de páginas
    optimizePackageImports: ['@headlessui/react', 'lucide-react'],
  },

  // Optimizaciones de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'digitalassets.tesla.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Optimizaciones de red
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Compresión automática
  compress: true,

  // Configuración de locale para Europa (evita errores de hidratación)
  i18n: {
    locales: ['ca-ES'],
    defaultLocale: 'ca-ES',
  },

  // Optimización de chunks
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
}

module.exports = nextConfig