// src/app/api/entretiens/dates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addHours } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les entretiens
    const entretiens = await prisma.entretien.findMany({
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
    
    console.log(`Traitement de ${entretiens.length} entretiens pour extraction des dates`);
    
    // Tableau pour stocker les événements du calendrier
    const calendarEvents = [];
    
    // Parcourir chaque entretien pour extraire les dates importantes
    for (const entretien of entretiens) {
      try {
        // Vérifier que l'entretien a des données
        if (!entretien.donneesEntretien) {
          continue;
        }
        
        // Convertir les données JSON en objet
        const donnees = JSON.parse(entretien.donneesEntretien);
        
        // D'après votre component Actions.tsx, voici la structure à utiliser :
        
        // 1. Date de rappel Manager
        if (donnees.conclusion?.actions?.manager?.entretienNecessaire && 
            donnees.conclusion?.actions?.manager?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.manager.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-manager`,
            title: `Entretien Manager - ${entretien.patient.prenom} ${entretien.patient.nom}`,
            description: donnees.conclusion.actions.manager.commentaire || "Entretien avec le manager",
            startDate: new Date(dateRappel + 'T09:00:00'), // Ajouter heure par défaut 9h00
            endDate: new Date(dateRappel + 'T10:00:00'),   // Durée d'une heure par défaut
            allDay: false,
            eventType: "Entretien Manager",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: entretien.patient,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
          console.log(`✅ Date d'entretien manager extraite pour patient ${entretien.patientId}`);
        }
        
        // 2. Prochain Entretien
        if (donnees.conclusion?.actions?.entretien?.aPrevoir && 
            donnees.conclusion?.actions?.entretien?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.entretien.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-prochain`,
            title: `Prochain Entretien - ${entretien.patient.prenom} ${entretien.patient.nom}`,
            description: "Entretien de suivi",
            startDate: new Date(dateRappel + 'T10:00:00'),
            endDate: new Date(dateRappel + 'T11:00:00'),
            allDay: false,
            eventType: "Entretien Infirmier",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: entretien.patient,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
          console.log(`✅ Date de prochain entretien extraite pour patient ${entretien.patientId}`);
        }
        
        // 3. Visite Médicale
        if (donnees.conclusion?.actions?.visiteMedicale?.aPlanifier && 
            donnees.conclusion?.actions?.visiteMedicale?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.visiteMedicale.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-visite`,
            title: `Visite Médicale - ${entretien.patient.prenom} ${entretien.patient.nom}`,
            description: donnees.conclusion.actions.visiteMedicale.commentaire || "Visite médicale planifiée",
            startDate: new Date(dateRappel + 'T11:00:00'),
            endDate: new Date(dateRappel + 'T12:00:00'),
            allDay: false,
            eventType: "Visite Médicale",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: entretien.patient,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
          console.log(`✅ Date de visite médicale extraite pour patient ${entretien.patientId}`);
        }
        
        // Vous pouvez ajouter d'autres extractions selon les besoins
        
      } catch (error) {
        console.error(`Erreur lors du traitement de l'entretien ${entretien.id}:`, error);
        // Continuer avec le prochain entretien
      }
    }
    
    console.log(`Total d'événements extraits des entretiens: ${calendarEvents.length}`);
    
    return NextResponse.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    console.error('Erreur lors de l\'extraction des dates:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}