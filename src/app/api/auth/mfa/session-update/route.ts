// src/app/api/auth/mfa/session-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Récupérer la session courante
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le token JWT actuel depuis les cookies
    const token = request.cookies.get('next-auth.session-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de session manquant' },
        { status: 401 }
      );
    }

    // Décoder le token pour récupérer les données actuelles
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET non configuré');
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, secret) as any;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Mettre à jour le token avec mfaVerified = true
    const updatedToken = {
      ...decodedToken,
      mfaVerified: true,
      iat: Math.floor(Date.now() / 1000), // Nouveau timestamp
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 jours
    };

    // Créer un nouveau token JWT
    const newToken = jwt.sign(updatedToken, secret);

    // Créer la réponse avec le nouveau cookie
    const response = NextResponse.json({ success: true });
    
    // Mettre à jour le cookie de session
    response.cookies.set('next-auth.session-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la mise à jour de session MFA:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}