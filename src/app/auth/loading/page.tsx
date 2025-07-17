// src/app/auth/loading/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSession, getSession } from 'next-auth/react';

export default function AuthLoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: session, status } = useSession();
  const [loadingMessage, setLoadingMessage] = useState('Chargement...');
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Références pour nettoyer les timers
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vérifier si on vient de la validation MFA
  const fromMFA = searchParams?.get('from') === 'mfa';

  // Simplifié : pas d'étapes multiples
  const startLoading = useCallback(() => {
    setLoadingMessage('Chargement...');
  }, []);

  // Forcer mise à jour session si on vient de MFA
  useEffect(() => {
    if (fromMFA) {
      console.log('🔄 Forçage mise à jour session post-MFA');
      // Forcer une nouvelle récupération de session pour obtenir mfaVerified=true
      getSession().then((newSession) => {
        console.log('📝 Session mise à jour:', newSession?.user?.mfaVerified);
      });
    }
  }, [fromMFA]);

  useEffect(() => {
    console.log('🚀 AuthLoading - Initialisation, fromMFA:', fromMFA);
    
    // Message simple selon la source
    if (fromMFA) {
      setLoadingMessage('Authentification réussie');
    } else {
      setLoadingMessage('Chargement...');
    }

    // Nettoyage au démontage
    return () => {
      console.log('🧹 Nettoyage composant AuthLoading');
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [fromMFA]);

  // Empêcher le retour vers la page MFA en bloquant l'historique
  useEffect(() => {
    // Remplacer l'entrée dans l'historique pour empêcher le retour
    window.history.replaceState(null, '', '/auth/loading');
    
    // Bloquer le bouton retour du navigateur
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', '/auth/loading');
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Timeout de sécurité pour éviter que la page reste bloquée
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⚠️ Timeout de sécurité atteint - redirection forcée');
      setTimeoutReached(true);
    }, 5000); // 5 secondes max pour plus de réactivité

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log('🔍 Session check:', {
      isAuthenticated,
      isLoading,
      hasSession: !!session?.user,
      mfaVerified: session?.user?.mfaVerified,
      redirectAttempted,
      timeoutReached
    });
    
    // Rediriger quand l'authentification ET le MFA sont complètement validés
    if ((isAuthenticated && !isLoading && session?.user && session?.user?.mfaVerified && !redirectAttempted) || timeoutReached) {
      console.log('✅ Conditions de redirection remplies - démarrage redirection');
      
      // Vérifier que la session est bien établie
      setRedirectAttempted(true);
      
      // Délai minimal et uniforme
      const baseDelay = 800; // Délai fixe simplifié
      console.log('⏱️ Délai avant redirection:', baseDelay, 'ms');
      
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🎯 Redirection maintenant vers /');
        // Redirection directe sans message intermédiaire
        window.location.href = '/';
      }, baseDelay);
    } else if (session?.user && !session?.user?.mfaVerified) {
      console.log('⏳ En attente vérification MFA - session.user.mfaVerified:', session?.user?.mfaVerified);
    } else {
      console.log('⏸️ En attente session complète...');
    }
  }, [isAuthenticated, isLoading, session, redirectAttempted, timeoutReached, fromMFA]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fond glassmorphisme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 backdrop-blur-sm" />
      
      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        {/* Container principal avec effet glassmorphisme */}
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/20">
          
          {/* Logo ou titre */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <div className="text-white text-2xl font-bold">VS</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Vital Sync</h1>
            <p className="text-gray-600">Chargement en cours...</p>
          </div>

          {/* Spinner */}
          <div className="mb-8">
            <div className="relative w-16 h-16 mx-auto">
              {/* Cercle de fond */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              
              {/* Cercle animé */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              
              {/* Point central */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* Message de chargement simplifié */}
          <div className="space-y-6">
            <p className="text-lg font-medium text-gray-700">
              {loadingMessage}
            </p>
          </div>

          {/* Indication de sécurité */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connexion sécurisée</span>
          </div>
        </div>

        {/* Indicateurs de sécurité en bas */}
        <div className="mt-8 flex justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Chiffrement AES-256</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Authentification 2FA</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>RGPD Conforme</span>
          </div>
        </div>
      </div>
    </div>
  );
}