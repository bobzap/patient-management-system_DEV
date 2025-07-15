// src/app/api/auth/mfa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMFASecret, generateBackupCodes } from '@/lib/mfa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérification que l'utilisateur existe
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

    // Vérification que MFA n'est pas déjà activée
    if (userProfile.mfa?.isEnabled) {
      return NextResponse.json(
        { error: 'MFA déjà activée' },
        { status: 400 }
      );
    }

    // Génération du secret TOTP
    const mfaSecret = generateMFASecret(session.user.email);
    
    // Génération des codes de récupération
    const { codes: backupCodes, encryptedCodes } = generateBackupCodes(10);

    // Sauvegarde ou mise à jour des données MFA (pas encore activée)
    const mfaData = await prisma.userMFA.upsert({
      where: { userId: userProfile.userId },
      create: {
        userId: userProfile.userId,
        secret: JSON.stringify(mfaSecret.secret),
        backupCodes: encryptedCodes.map(code => JSON.stringify(code)),
        isEnabled: false,
        failedAttempts: 0
      },
      update: {
        secret: JSON.stringify(mfaSecret.secret),
        backupCodes: encryptedCodes.map(code => JSON.stringify(code)),
        failedAttempts: 0,
        lockedUntil: null
      }
    });

    // Log de l'événement
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'MFA_SETUP',
        success: true,
        details: {
          timestamp: new Date().toISOString(),
          step: 'setup'
        }
      }
    });

    return NextResponse.json({
      qrCodeUrl: mfaSecret.qrCodeUrl,
      manualEntryKey: mfaSecret.manualEntryKey,
      backupCodes
    });

  } catch (error) {
    // Log sécurisé selon l'environnement
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA setup error:', error);
    } else {
      console.error('MFA setup failed');
    }
    
    // Log d'audit sans données sensibles
    if (session?.user?.id) {
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_SETUP',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            errorType: 'setup_failed'
          }
        }
      }).catch(() => {}); // Ignorer les erreurs de log
    }

    return NextResponse.json(
      { error: 'Configuration impossible' },
      { status: 500 }
    );
  }
}