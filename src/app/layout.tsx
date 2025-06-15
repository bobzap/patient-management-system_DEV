// src/app/layout.tsx - Version avec authentification
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nunito } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Police existantes
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Nunito pour une apparence moderne
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Vital Sync - Gestion des Entretiens Infirmiers",
  description: "Système sécurisé de gestion des entretiens infirmiers et données de santé",
  keywords: "santé, infirmier, entretiens, médical, sécurisé",
  authors: [{ name: "Vital Sync Team" }],
  robots: "noindex, nofollow", // Sécurité: ne pas indexer
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Sécurité : Headers de sécurité */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
       
        {/* CSP basique - à adapter selon vos besoins */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self';" 
        />
      </head>
     
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} font-nunito antialiased`}
      >
        {/* Provider d'authentification pour toute l'application */}
        <AuthProvider>
          {children}
        </AuthProvider>
       
        {/* Toast notifications */}
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