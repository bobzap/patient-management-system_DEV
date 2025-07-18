// src/app/api/consent/bulk/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Récupérer les statistiques de consentement
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includePending = url.searchParams.get('includePending') === 'true';
    const departement = url.searchParams.get('departement');

    // Construire les filtres
    const patientFilter: any = {};
    if (departement) {
      patientFilter.departement = departement;
    }

    // Récupérer les statistiques
    const stats = await prisma.patientConsent.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        patient: patientFilter
      }
    });

    // Récupérer les patients sans consentement
    const patientsWithoutConsent = await prisma.patient.findMany({
      where: {
        AND: [
          patientFilter,
          {
            consentementDonnees: null
          }
        ]
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        civilites: true,
        departement: true,
        poste: true
      }
    });

    // Récupérer les consentements récents
    const recentConsents = await prisma.patientConsent.findMany({
      where: {
        patient: patientFilter
      },
      include: {
        patient: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            civilites: true,
            departement: true,
            poste: true
          }
        }
      },
      orderBy: {
        dateModification: 'desc'
      },
      take: 20
    });

    // Calculer les statistiques finales
    const totalPatients = await prisma.patient.count({
      where: patientFilter
    });

    const statsFormatted = {
      ACCEPTED: 0,
      REFUSED: 0,
      PENDING: 0,
      REVOKED: 0,
      EXPIRED: 0,
      WITHOUT_CONSENT: patientsWithoutConsent.length
    };

    stats.forEach(stat => {
      statsFormatted[stat.status] = stat._count.id;
    });

    return NextResponse.json({
      data: {
        statistics: statsFormatted,
        totalPatients,
        patientsWithoutConsent,
        recentConsents,
        complianceRate: totalPatients > 0 
          ? ((statsFormatted.ACCEPTED + statsFormatted.REFUSED) / totalPatients * 100).toFixed(1)
          : '0.0'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

// Mettre à jour plusieurs consentements en lot (admin uniquement)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { patientIds, status, commentaire, raisonModification } = body;

    // Validation
    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ error: 'Liste des patients invalide' }, { status: 400 });
    }

    const validStatuses = ['ACCEPTED', 'REFUSED', 'PENDING', 'REVOKED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut de consentement invalide' }, { status: 400 });
    }

    // Récupérer les informations de la requête
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userId = session.user?.id || 'system';

    // Traitement en lot
    const results = await prisma.$transaction(async (tx) => {
      const updated = [];
      const created = [];
      const errors = [];

      for (const patientId of patientIds) {
        try {
          // Vérifier que le patient existe
          const patient = await tx.patient.findUnique({
            where: { id: patientId }
          });

          if (!patient) {
            errors.push({ patientId, error: 'Patient non trouvé' });
            continue;
          }

          // Vérifier si un consentement existe déjà
          const existingConsent = await tx.patientConsent.findUnique({
            where: { patientId }
          });

          if (existingConsent) {
            // Créer un historique
            await tx.consentHistory.create({
              data: {
                consentId: existingConsent.id,
                ancienStatus: existingConsent.status,
                nouveauStatus: status,
                raisonModification: raisonModification || 'Mise à jour en lot',
                modifiePar: userId,
                ipAddress,
                userAgent
              }
            });

            // Mettre à jour
            const updatedConsent = await tx.patientConsent.update({
              where: { id: existingConsent.id },
              data: {
                status,
                commentaire,
                modifiedBy: userId,
                ipAddress,
                userAgent
              }
            });

            updated.push(updatedConsent);
          } else {
            // Créer un nouveau consentement
            const newConsent = await tx.patientConsent.create({
              data: {
                patientId,
                status,
                commentaire,
                createdBy: userId,
                modifiedBy: userId,
                ipAddress,
                userAgent
              }
            });

            created.push(newConsent);
          }
        } catch (error) {
          errors.push({ patientId, error: error.message });
        }
      }

      return { updated, created, errors };
    });

    return NextResponse.json({
      data: results,
      message: `Traitement terminé: ${results.updated.length} mis à jour, ${results.created.length} créés, ${results.errors.length} erreurs`
    });

  } catch (error) {
    console.error('Erreur lors du traitement en lot:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement en lot' },
      { status: 500 }
    );
  }
}