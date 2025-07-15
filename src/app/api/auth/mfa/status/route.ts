// src/app/api/auth/mfa/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isUserLocked, countRemainingBackupCodes } from '@/lib/mfa';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Recherche des données MFA de l'utilisateur
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: { mfa: true }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const mfaData = userProfile.mfa;

    if (!mfaData) {
      // MFA pas encore configurée
      return NextResponse.json({
        isEnabled: false,
        hasBackupCodes: false,
        remainingBackupCodes: 0,
        isLocked: false
      });
    }

    // Vérification du verrouillage
    const isLocked = isUserLocked(mfaData.failedAttempts, mfaData.lockedUntil);
    
    // Comptage des codes de backup restants
    const remainingBackupCodes = countRemainingBackupCodes(mfaData.backupCodes);

    return NextResponse.json({
      isEnabled: mfaData.isEnabled,
      hasBackupCodes: remainingBackupCodes > 0,
      remainingBackupCodes,
      lastUsedAt: mfaData.lastUsedAt,
      isLocked,
      unlockAt: mfaData.lockedUntil
    });

  } catch (error) {
    console.error('Erreur récupération statut MFA:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}