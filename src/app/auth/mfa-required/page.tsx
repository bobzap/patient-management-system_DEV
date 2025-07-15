// src/app/auth/mfa-required/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MFASetupWizard } from '@/components/auth/MFASetupWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export default function MFARequiredPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Si l'utilisateur a déjà la 2FA activée, rediriger vers vérification
    if (session.user.mfaVerified) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleMFASetupComplete = async () => {
    // Actualiser la session et rediriger vers la page d'accueil
    window.location.href = '/';
  };

  const handleCancel = () => {
    // Déconnecter l'utilisateur s'il refuse d'activer la 2FA
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
        {/* En-tête explicatif */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-amber-800">
              Double authentification requise
            </CardTitle>
            <CardDescription className="text-amber-700">
              Pour votre sécurité, la 2FA est maintenant obligatoire pour tous les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Politique de sécurité :</strong><br />
                Tous les comptes doivent activer la double authentification 
                pour accéder au système de gestion des patients.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Assistant de configuration */}
        <MFASetupWizard
          onComplete={handleMFASetupComplete}
          onCancel={handleCancel}
        />

        {/* Informations supplémentaires */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            <strong>Pourquoi la 2FA est-elle obligatoire ?</strong>
          </p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Protection des données médicales sensibles</li>
            <li>Conformité aux réglementations de sécurité</li>
            <li>Prévention des accès non autorisés</li>
            <li>Traçabilité des actions utilisateur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}