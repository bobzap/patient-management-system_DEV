// src/app/api/auth/mfa/disable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTOTPCode } from '@/lib/mfa';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { password, mfaCode } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis pour désactiver la 2FA' },
        { status: 400 }
      );
    }

    // Vérification du mot de passe
    const authUser = await prisma.authUser.findUnique({
      where: { id: session.user.id }
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, authUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
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

    // Vérification du code MFA (obligatoire pour la désactivation)
    if (!mfaCode) {
      return NextResponse.json(
        { error: 'Code MFA requis pour la désactivation' },
        { status: 400 }
      );
    }

    const encryptedSecret = JSON.parse(userProfile.mfa.secret);
    const isValidCode = await verifyTOTPCode(encryptedSecret, mfaCode);

    if (!isValidCode) {
      // Log de la tentative échouée
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_DISABLE_FAILED',
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

    // Suppression des données MFA
    await prisma.userMFA.delete({
      where: { userId: userProfile.userId }
    });

    // Log de la désactivation réussie
    await prisma.authLog.create({
      data: {
        userId: session.user.id,
        action: 'MFA_DISABLED',
        success: true,
        details: {
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Double authentification désactivée avec succès'
    });

  } catch (error) {
    // Log sécurisé par environnement
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA disable error:', error);
    } else {
      console.error('MFA deactivation failed');
    }
    
    // Log d'audit sans exposition de données
    if (session?.user?.id) {
      await prisma.authLog.create({
        data: {
          userId: session.user.id,
          action: 'MFA_DISABLE_ERROR',
          success: false,
          details: {
            timestamp: new Date().toISOString(),
            errorType: 'disable_failed'
          }
        }
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: 'Désactivation impossible' },
      { status: 500 }
    );
  }
}