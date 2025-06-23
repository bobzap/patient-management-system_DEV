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
          position="top-right"
          richColors
          closeButton
          duration={4000}
          expand={false}
          visibleToasts={3}
          gap={8}
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151',
            },
            className: 'toast-custom'
          }}
        />
      </body>
    </html>
  );
}