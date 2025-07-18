// src/app/api/patients/[id]/consent/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type ConsentStatus = 'ACCEPTED' | 'REFUSED' | 'PENDING';

interface ConsentRequest {
  status: ConsentStatus;
  commentaire?: string;
  raisonModification?: string;
}

// Obtenir le consentement d'un patient
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID patient invalide' }, { status: 400 });
    }

    const consent = await prisma.patientConsent.findUnique({
      where: { patientId },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            civilites: true
          }
        },
        historique: {
          orderBy: { dateModification: 'desc' },
          take: 10
        }
      }
    });

    if (!consent) {
      return NextResponse.json({ 
        data: null,
        message: 'Aucun consentement trouvé pour ce patient' 
      });
    }

    return NextResponse.json({ data: consent });
  } catch (error) {
    console.error('Erreur lors de la récupération du consentement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du consentement' },
      { status: 500 }
    );
  }
}

// Créer ou mettre à jour le consentement d'un patient
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID patient invalide' }, { status: 400 });
    }

    const body: ConsentRequest = await request.json();
    const { status, commentaire, raisonModification } = body;

    // Validation du statut
    const validStatuses: ConsentStatus[] = ['ACCEPTED', 'REFUSED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut de consentement invalide' }, { status: 400 });
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
    }

    // Récupérer les informations de la requête
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userId = session.user?.id || 'system';

    // Vérifier si un consentement existe déjà
    const existingConsent = await prisma.patientConsent.findUnique({
      where: { patientId }
    });

    let result;

    if (existingConsent) {
      // Mettre à jour le consentement existant
      result = await prisma.$transaction(async (tx) => {
        // Créer un historique avant la mise à jour
        await tx.consentHistory.create({
          data: {
            consentId: existingConsent.id,
            ancienStatus: existingConsent.status,
            nouveauStatus: status,
            raisonModification,
            modifiePar: userId,
            ipAddress,
            userAgent
          }
        });

        // Mettre à jour le consentement
        return await tx.patientConsent.update({
          where: { id: existingConsent.id },
          data: {
            status,
            commentaire,
            modifiedBy: userId,
            ipAddress,
            userAgent
          },
          include: {
            patient: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                civilites: true
              }
            }
          }
        });
      });
    } else {
      // Créer un nouveau consentement
      result = await prisma.patientConsent.create({
        data: {
          patientId,
          status,
          commentaire,
          createdBy: userId,
          modifiedBy: userId,
          ipAddress,
          userAgent
        },
        include: {
          patient: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              civilites: true
            }
          }
        }
      });
    }

    return NextResponse.json({ 
      data: result,
      message: existingConsent ? 'Consentement mis à jour avec succès' : 'Consentement créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du consentement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la sauvegarde du consentement' },
      { status: 500 }
    );
  }
}

// Supprimer le consentement d'un patient (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID patient invalide' }, { status: 400 });
    }

    const consent = await prisma.patientConsent.findUnique({
      where: { patientId }
    });

    if (!consent) {
      return NextResponse.json({ error: 'Consentement non trouvé' }, { status: 404 });
    }

    await prisma.patientConsent.delete({
      where: { id: consent.id }
    });

    return NextResponse.json({ 
      message: 'Consentement supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du consentement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du consentement' },
      { status: 500 }
    );
  }
}