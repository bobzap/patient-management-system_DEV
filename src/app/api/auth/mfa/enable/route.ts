// src/app/api/auth/mfa/enable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTOTPCode } from '@/lib/mfa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    // Récupération des données MFA
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: { mfa: true }
    });

    if (!userProfile?.mfa) {
      return NextResponse.json(
        { error: 'MFA non configurée. Veuillez d\'abord initialiser la 2FA.' },
        { status: 400 }
      );
    }

    if (userProfile.mfa.isEnabled) {
      return NextResponse.json(
        { error: 'MFA déjà activée' },
        { status: 400 }
      );
    }

    // Déchiffrement et vérification du code
    const encryptedSecret = JSON.parse(userProfile.mfa.secret);
    const isValidCode = await verifyTOTPCode(encryptedSecret, code);

    if (!isValidCode) {
      // Log de la tentative échouée
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_ENABLE_FAILED',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            reason: 'Invalid code'
          }
        }
      });

      return NextResponse.json(
        { error: 'Code de vérification incorrect' },
        { status: 400 }
      );
    }

    // Activation de la MFA
    await prisma.userMFA.update({
      where: { userId: userProfile.userId },
      data: {
        isEnabled: true,
        enabledAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null
      }
    });

    // Log de l'activation réussie
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'MFA_ENABLED',
        success: true,
        details: {
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Double authentification activée avec succès'
    });

  } catch (error) {
    // Log conditionnel selon l'environnement
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA enable error:', error);
    } else {
      console.error('MFA activation failed');
    }
    
    // Log d'audit sécurisé
    if (session?.user?.id) {
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_ENABLE_ERROR',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            errorType: 'enable_failed'
          }
        }
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: 'Activation impossible' },
      { status: 500 }
    );
  }
}