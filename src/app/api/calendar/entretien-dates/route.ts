// src/app/api/calendar/entretien-dates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les entretiens finalisés
    const entretiens = await prisma.entretien.findMany({
      where: {
        status: 'finalise' // Ou le statut que vous utilisez pour les entretiens finalisés
      },
      include: {
        patient: {
          select: {
            id: true,
            civilites: true,
            nom: true,
            prenom: true,
            departement: true,
          },
        },
      }
    });
    
    // Extraire les dates importantes de chaque entretien
    const events = [];
    
    for (const entretien of entretiens) {
      try {
        // Transformer les données JSON en objet JavaScript
        const donneesEntretien = JSON.parse(entretien.donneesEntretien);
        
        // Chercher des champs de date dans l'entretien
        // Par exemple, si vous avez des champs comme "dateProchainRDV", "dateRappel", etc.
        if (donneesEntretien.dateProchainRDV) {
          events.push({
            id: `entretien-${entretien.id}-prochain-rdv`,
            title: `Prochain RDV - ${entretien.patient.prenom} ${entretien.patient.nom}`,
            description: "Rendez-vous planifié lors d'un entretien",
            startDate: new Date(donneesEntretien.dateProchainRDV),
            endDate: new Date(new Date(donneesEntretien.dateProchainRDV).getTime() + 60*60*1000), // +1 heure par défaut
            allDay: false,
            eventType: "Rendez-vous planifié",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: entretien.patient,
            entretienId: entretien.id
          });
        }
        
        // Autres dates à extraire selon votre structure...
        
      } catch (error) {
        console.error(`Erreur lors du traitement de l'entretien ${entretien.id}:`, error);
        // Continuer avec le prochain entretien
      }
    }
    
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dates d\'entretien:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}