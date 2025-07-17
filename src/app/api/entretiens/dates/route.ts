// src/app/api/entretiens/dates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addHours } from 'date-fns';
import { decryptString } from '@/lib/encryption';

/**
 * Déchiffre un champ patient si nécessaire
 */
function decryptPatientField(field: string): string {
  if (!field) return '';
  
  // Si c'est une chaîne qui commence par {"encrypted", c'est chiffré
  if (typeof field === 'string' && field.startsWith('{"encrypted"')) {
    try {
      const encrypted = JSON.parse(field);
      if (encrypted.encrypted && encrypted.iv) {
        return decryptString(encrypted);
      }
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      return '[Erreur déchiffrement]';
    }
  }
  
  // Sinon, retourner la valeur telle quelle
  return field;
}

/**
 * Déchiffre les données d'un patient
 */
function decryptPatientData(patient: any): any {
  if (!patient) return null;
  
  return {
    ...patient,
    nom: decryptPatientField(patient.nom),
    prenom: decryptPatientField(patient.prenom),
    departement: decryptPatientField(patient.departement)
  };
}

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
    
    
    
    // Tableau pour stocker les événements du calendrier
    const calendarEvents = [];
    
    // Parcourir chaque entretien pour extraire les dates importantes
    for (const entretien of entretiens) {
      try {
        // Vérifier que l'entretien a des données
        if (!entretien.donneesEntretien) {
          continue;
        }
        
        // Déchiffrer les données patient
        const patientDechiffre = decryptPatientData(entretien.patient);
        
        // Convertir les données JSON en objet
        const donnees = JSON.parse(entretien.donneesEntretien);
        
        // D'après votre component Actions.tsx, voici la structure à utiliser :
        
        // 1. Date de rappel Manager
        if (donnees.conclusion?.actions?.manager?.entretienNecessaire && 
            donnees.conclusion?.actions?.manager?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.manager.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-manager`,
            title: `Entretien Manager - ${patientDechiffre.prenom} ${patientDechiffre.nom}`,
            description: donnees.conclusion.actions.manager.commentaire || "Entretien avec le manager",
            startDate: new Date(dateRappel + 'T09:00:00'), // Ajouter heure par défaut 9h00
            endDate: new Date(dateRappel + 'T10:00:00'),   // Durée d'une heure par défaut
            allDay: false,
            eventType: "Entretien Manager",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: patientDechiffre,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
         
        }
        
        // 2. Prochain Entretien
        if (donnees.conclusion?.actions?.entretien?.aPrevoir && 
            donnees.conclusion?.actions?.entretien?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.entretien.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-prochain`,
            title: `Prochain Entretien - ${patientDechiffre.prenom} ${patientDechiffre.nom}`,
            description: "Entretien de suivi",
            startDate: new Date(dateRappel + 'T10:00:00'),
            endDate: new Date(dateRappel + 'T11:00:00'),
            allDay: false,
            eventType: "Entretien Infirmier",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: patientDechiffre,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
          
        }
        
        // 3. Visite Médicale
        if (donnees.conclusion?.actions?.visiteMedicale?.aPlanifier && 
            donnees.conclusion?.actions?.visiteMedicale?.dateRappel) {
          
          const dateRappel = donnees.conclusion.actions.visiteMedicale.dateRappel;
          
          calendarEvents.push({
            id: `entretien-${entretien.id}-visite`,
            title: `Visite Médicale - ${patientDechiffre.prenom} ${patientDechiffre.nom}`,
            description: donnees.conclusion.actions.visiteMedicale.commentaire || "Visite médicale planifiée",
            startDate: new Date(dateRappel + 'T11:00:00'),
            endDate: new Date(dateRappel + 'T12:00:00'),
            allDay: false,
            eventType: "Visite Médicale",
            status: "Planifié",
            patientId: entretien.patientId,
            patient: patientDechiffre,
            entretienId: entretien.id,
            source: 'entretien'
          });
          
          
        }
        
        // Vous pouvez ajouter d'autres extractions selon les besoins
        
      } catch (error) {
        
        // Continuer avec le prochain entretien
      }
    }
    
    
    
    return NextResponse.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}