// src/app/api/auth/mfa/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  verifyTOTPCode, 
  verifyBackupCode, 
  invalidateBackupCode,
  isUserLocked,
  getUnlockTime,
  countRemainingBackupCodes 
} from '@/lib/mfa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { code, isBackupCode = false } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code requis' },
        { status: 400 }
      );
    }

    // Récupération des données MFA
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: { mfa: true }
    });

    if (!userProfile?.mfa || !userProfile.mfa.isEnabled) {
      return NextResponse.json(
        { error: 'MFA non activée' },
        { status: 400 }
      );
    }

    const mfaData = userProfile.mfa;

    // Vérification du verrouillage
    if (isUserLocked(mfaData.failedAttempts, mfaData.lockedUntil)) {
      return NextResponse.json({
        success: false,
        isLocked: true,
        unlockAt: mfaData.lockedUntil,
        error: 'Compte temporairement verrouillé suite à trop de tentatives échouées'
      }, { status: 423 });
    }

    let isValidCode = false;
    let updatedBackupCodes = mfaData.backupCodes;

    if (isBackupCode) {
      // Vérification d'un code de récupération
      const backupCodes = mfaData.backupCodes.map(code => JSON.parse(code));
      const verification = await verifyBackupCode(backupCodes, code);
      
      if (verification.isValid) {
        isValidCode = true;
        // Invalider le code de backup utilisé
        const newBackupCodes = invalidateBackupCode(backupCodes, verification.codeIndex);
        updatedBackupCodes = newBackupCodes.map(code => code ? JSON.stringify(code) : null);
      }
    } else {
      // Vérification d'un code TOTP
      const encryptedSecret = JSON.parse(mfaData.secret);
      isValidCode = await verifyTOTPCode(encryptedSecret, code);
    }

    if (isValidCode) {
      // Code valide - Mise à jour des données
      await prisma.userMFA.update({
        where: { userId: userProfile.userId },
        data: {
          lastUsedAt: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
          ...(isBackupCode && { backupCodes: updatedBackupCodes.filter(code => code !== null) })
        }
      });

      // Marquer la MFA comme vérifiée pour cette session
      const { markMFAVerified } = await import('@/lib/mfa-session-store');
      
      // Créer un ID de session unique basé sur l'utilisateur et le timestamp
      const sessionId = `${session.user.id}-${Date.now()}`;
      
      // Marquer cette session comme vérifiée
      markMFAVerified(sessionId, session.user.id);
      
      // Stocker le sessionId dans une base temporaire pour le callback JWT
      global.mfaVerifiedSessions = global.mfaVerifiedSessions || new Set();
      global.mfaVerifiedSessions.add(session.user.id);

      // Log de la vérification réussie
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_VERIFY_SUCCESS',
          success: true,
          details: {
            timestamp: new Date().toISOString(),
            method: isBackupCode ? 'backup_code' : 'totp',
            remainingBackupCodes: isBackupCode ? countRemainingBackupCodes(updatedBackupCodes) : undefined
          }
        }
      });

      return NextResponse.json({
        success: true,
        remainingBackupCodes: isBackupCode ? countRemainingBackupCodes(updatedBackupCodes) : undefined
      });

    } else {
      // Code invalide - Incrémenter les tentatives échouées
      const newFailedAttempts = mfaData.failedAttempts + 1;
      const unlockTime = getUnlockTime(newFailedAttempts);

      await prisma.userMFA.update({
        where: { userId: userProfile.userId },
        data: {
          failedAttempts: newFailedAttempts,
          lockedUntil: unlockTime
        }
      });

      // Log de la tentative échouée
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_VERIFY_FAIL',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            method: isBackupCode ? 'backup_code' : 'totp',
            failedAttempts: newFailedAttempts,
            isLocked: unlockTime !== null
          }
        }
      });

      const response = {
        success: false,
        error: 'Code invalide',
        isLocked: unlockTime !== null,
        unlockAt: unlockTime
      };

      return NextResponse.json(response, { status: 400 });
    }

  } catch (error) {
    // Log sécurisé : détails en dev seulement
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA verify error:', error);
    } else {
      console.error('MFA verification failed for user');
    }
    
    // Log d'audit sécurisé
    if (session?.user?.id) {
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_VERIFY_ERROR',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            errorType: 'verification_failed'
          }
        }
      }).catch(() => {}); // Ignorer silencieusement les erreurs de log
    }

    return NextResponse.json(
      { error: 'Vérification échouée' },
      { status: 400 }
    );
  }
}