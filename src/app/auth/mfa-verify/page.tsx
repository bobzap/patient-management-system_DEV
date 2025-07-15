// src/app/auth/mfa-verify/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MFAVerificationForm } from '@/components/auth/MFAVerificationForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Info } from 'lucide-react';

export default function MFAVerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Si l'utilisateur a déjà vérifié sa 2FA, rediriger
    if (session.user.mfaVerified) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleVerificationSuccess = async () => {
    // Mettre à jour le token pour marquer la 2FA comme vérifiée
    try {
      const response = await fetch('/api/auth/mfa/session-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Rediriger vers la page d'accueil
        window.location.href = '/';
      } else {
        console.error('Erreur mise à jour session');
        // Fallback : actualiser la page
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Fallback : rediriger directement
      window.location.href = '/';
    }
  };

  const handleCancel = () => {
    // Déconnecter l'utilisateur
    window.location.href = '/api/auth/signout';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vérification requise
          </h1>
          <p className="text-gray-600 mt-2">
            Complétez l'authentification pour accéder à votre compte
          </p>
        </div>

        {/* Information utilisateur */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">
                  Connecté en tant que : {session.user.email}
                </p>
                <p className="text-blue-700">
                  Vérifiez votre identité avec votre code 2FA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de vérification */}
        <MFAVerificationForm
          onVerificationSuccess={handleVerificationSuccess}
          onCancel={handleCancel}
          isRequired={true}
          title="Code d'authentification requis"
          description="Saisissez le code de votre application d'authentification"
        />

        {/* Aide */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>Besoin d'aide ?</strong>
          </p>
          <div className="space-y-1">
            <p>• Utilisez votre application d'authentification (Google Authenticator, Authy...)</p>
            <p>• En cas de problème, utilisez un code de récupération</p>
            <p>• Contactez l'administrateur si vous avez perdu l'accès</p>
          </div>
        </div>
      </div>
    </div>
  );
}