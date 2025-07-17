// src/app/layout.tsx - Version optimisée
import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google'; // ✨ Nouvelle version Google
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';

// ✨ Geist Google Fonts - Plus moderne et performant
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['300', '400', '500', '600', '700', '800'], // Plus de variantes
});

const geistMono = Geist_Mono({
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-geist-mono',
  weight: ['300', '400', '500', '600', '700'],
});

// Ajoutez ceci dans votre src/app/layout.tsx dans les metadata :
export const metadata: Metadata = {
  title: "Vital Sync - Gestion des Entretiens Infirmiers",
  description: "Système sécurisé de gestion des entretiens infirmiers et données de santé",
  keywords: "santé, infirmier, entretiens, médical, sécurisé",
  authors: [{ name: "Vital Sync Team" }],
  robots: "noindex, nofollow",
  // ✨ Ajoutez cette ligne pour forcer un favicon par défaut
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Headers de sécurité */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* CSP mis à jour pour Google Fonts */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self';"
        />
      </head>
     
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
       
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4000}
          expand={false}
          visibleToasts={3}
          gap={8}
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(203, 213, 225, 0.3)',
              borderRadius: '12px',
              color: '#374151',
              padding: '16px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.06), 0 4px 16px 0 rgba(31, 38, 135, 0.04)',
              fontSize: '14px',
              fontWeight: '500',
            },
            className: 'toast-vital-sync',
            closeButton: {
              style: {
                color: '#64748b',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(203, 213, 225, 0.3)',
                borderRadius: '8px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }
            },
            success: {
              style: {
                background: 'rgba(34, 197, 94, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#ffffff',
                boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.2), 0 4px 16px 0 rgba(34, 197, 94, 0.1)',
              }
            },
            error: {
              style: {
                background: 'rgba(239, 68, 68, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ffffff',
                boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.2), 0 4px 16px 0 rgba(239, 68, 68, 0.1)',
              }
            },
            warning: {
              style: {
                background: 'rgba(245, 158, 11, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#ffffff',
                boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.2), 0 4px 16px 0 rgba(245, 158, 11, 0.1)',
              }
            },
            // Style spécial pour les notifications de sauvegarde automatique
            info: {
              style: {
                background: 'rgba(59, 130, 246, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#ffffff',
                boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.2), 0 4px 16px 0 rgba(59, 130, 246, 0.1)',
              }
            }
          }}
        />
      </body>
    </html>
  );
}