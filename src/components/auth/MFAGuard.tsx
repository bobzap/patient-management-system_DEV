// src/components/auth/MFAGuard.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface MFAGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant de protection qui vérifie si l'utilisateur a validé sa 2FA
 * Redirige automatiquement vers les pages appropriées si nécessaire
 */
export function MFAGuard({ children, fallback }: MFAGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Si l'utilisateur n'a pas activé la 2FA
    if (!session.user.requiresMFA) {
      router.push('/auth/mfa-required');
      return;
    }

    // Si l'utilisateur a activé la 2FA mais ne l'a pas encore vérifiée
    if (session.user.requiresMFA && !session.user.mfaVerified) {
      router.push('/auth/mfa-verify');
      return;
    }
  }, [session, status, router]);

  // Affichage pendant le chargement
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Pas de session
  if (!session) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  // 2FA non activée
  if (!session.user.requiresMFA) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-amber-500 mx-auto" />
          <p className="text-gray-600">Configuration de la sécurité requise...</p>
        </div>
      </div>
    );
  }

  // 2FA non vérifiée
  if (!session.user.mfaVerified) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-blue-500 mx-auto" />
          <p className="text-gray-600">Vérification de sécurité requise...</p>
        </div>
      </div>
    );
  }

  // Tout est OK, afficher le contenu protégé
  return <>{children}</>;
}

/**
 * Hook pour vérifier le statut MFA
 */
export function useMFAStatus() {
  const { data: session, status } = useSession();

  return {
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasMFA: session?.user?.requiresMFA || false,
    isMFAVerified: session?.user?.mfaVerified || false,
    needsSetup: session && !session.user.requiresMFA,
    needsVerification: session && session.user.requiresMFA && !session.user.mfaVerified,
    isFullyAuthenticated: session && session.user.requiresMFA && session.user.mfaVerified
  };
}