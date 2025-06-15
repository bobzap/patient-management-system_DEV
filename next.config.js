// next.config.js - Configuration CSP pour application médicale

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  
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
              "font-src 'self'", // Polices depuis le domaine uniquement
              "connect-src 'self'", // Connexions API limitées au domaine
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
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig