// src/app/api/debug/mfa-store/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Importer les fonctions du store MFA
    const { getMFASessionStats, isMFAVerified } = await import('@/lib/mfa-session-store');
    
    // Obtenir les statistiques
    const stats = getMFASessionStats();
    
    // Vérifier l'état MFA de l'utilisateur actuel
    const sessionId = `${session.user.id}-session`;
    const isVerified = isMFAVerified(sessionId, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        userId: session.user.id,
        sessionId,
        isCurrentUserVerified: isVerified,
        storeStats: stats,
        sessionInfo: {
          mfaEnabled: session.user.mfaEnabled,
          mfaVerified: session.user.mfaVerified,
          role: session.user.role
        }
      }
    });

  } catch (error) {
    console.error('Erreur debug MFA store:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}