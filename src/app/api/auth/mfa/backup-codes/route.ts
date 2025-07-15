// src/app/api/auth/mfa/backup-codes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBackupCodes, verifyTOTPCode } from '@/lib/mfa';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { mfaCode } = await request.json();

    if (!mfaCode) {
      return NextResponse.json(
        { error: 'Code MFA requis pour régénérer les codes de récupération' },
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

    // Vérification du code MFA
    const encryptedSecret = JSON.parse(userProfile.mfa.secret);
    const isValidCode = await verifyTOTPCode(encryptedSecret, mfaCode);

    if (!isValidCode) {
      // Log de la tentative échouée
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_BACKUP_REGEN_FAILED',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            reason: 'Invalid MFA code'
          }
        }
      });

      return NextResponse.json(
        { error: 'Code MFA incorrect' },
        { status: 400 }
      );
    }

    // Génération de nouveaux codes de récupération
    const { codes: newBackupCodes, encryptedCodes } = generateBackupCodes(10);

    // Mise à jour en base
    await prisma.userMFA.update({
      where: { userId: userProfile.userId },
      data: {
        backupCodes: encryptedCodes.map(code => JSON.stringify(code))
      }
    });

    // Log de la régénération réussie
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'MFA_BACKUP_REGEN',
        success: true,
        details: {
          timestamp: new Date().toISOString(),
          codesCount: newBackupCodes.length
        }
      }
    });

    return NextResponse.json({
      success: true,
      backupCodes: newBackupCodes,
      message: 'Nouveaux codes de récupération générés. Sauvegardez-les en lieu sûr.'
    });

  } catch (error) {
    // Log sécurisé conditionnel
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA backup regen error:', error);
    } else {
      console.error('Backup codes regeneration failed');
    }
    
    // Log d'audit simplifié
    if (session?.user?.id) {
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_BACKUP_REGEN_ERROR',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            errorType: 'regeneration_failed'
          }
        }
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: 'Régénération impossible' },
      { status: 500 }
    );
  }
}

// GET pour récupérer le nombre de codes restants
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
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

    // Comptage des codes restants
    const remainingCodes = userProfile.mfa.backupCodes.filter(code => code !== null).length;

    return NextResponse.json({
      remainingBackupCodes: remainingCodes,
      totalGenerated: 10
    });

  } catch (error) {
    console.error('Erreur récupération codes backup MFA:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}