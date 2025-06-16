// next.config.js - Configuration corrigée sans optimizeCss

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔧 CONFIGURATION BUILD ET DÉPLOIEMENT
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  
  // 🔧 CRITIQUE : Output standalone pour Docker
  output: 'standalone',
  
  // 🔧 Configuration des images optimisées
  images: {
    domains: ['api.vital-sync.ch'],
    unoptimized: false,
  },

  // 🔧 Configuration du cache et des performances
  compress: true,
  poweredByHeader: false,
  
  // 🔧 Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 🔧 Configuration des redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/lists',
        permanent: false,
      },
    ]
  },

  // 🔒 HEADERS DE SÉCURITÉ POUR APP MÉDICALE
  async headers() {
    return [
      {
        // Applique les headers de sécurité à toutes les routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'", // Seules les ressources du même domaine
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts autorisés (Next.js a besoin d'unsafe-inline)
              "style-src 'self' 'unsafe-inline'", // CSS autorisés
              "img-src 'self' data: https:", // Images depuis le domaine + data URLs + HTTPS
              "font-src 'self' https://fonts.gstatic.com", // Polices + Google Fonts si nécessaire
              "connect-src 'self' https://api.vital-sync.ch", // Connexions API autorisées
              "frame-src 'none'", // Pas d'iframes (protection clickjacking)
              "object-src 'none'", // Pas d'objets embed/object
              "base-uri 'self'", // Base URI sécurisée
              "form-action 'self'", // Formulaires uniquement vers le domaine
              "frame-ancestors 'none'", // Empêche l'embedding dans d'autres sites
              "upgrade-insecure-requests" // Force HTTPS en production
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Empêche totalement l'embedding
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Empêche le MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin' // Contrôle les referrers
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block' // Protection XSS legacy browsers
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains' // Force HTTPS pendant 1 an
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()' // Désactive les permissions sensibles
          }
        ]
      },
      {
        // Headers spécifiques pour les API
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  },

  // 🔧 Configuration Webpack personnalisée (si nécessaire)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    return config
  },

  // 🔧 Configuration expérimentale - CORRIGÉE
  experimental: {
    // 🔧 SUPPRESSION de optimizeCss qui causait l'erreur critters
    // optimizeCss: true, <- SUPPRIMÉ
    
    // Optimisations sûres
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // 🔧 Configuration de la compilation
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // 🔧 Configuration du serveur de développement
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),
}

module.exports = nextConfig