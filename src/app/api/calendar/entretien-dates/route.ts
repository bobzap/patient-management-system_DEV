// src/app/api/calendar/entretien-dates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    
    // Récupérer les entretiens finalisés avec patients
    const { data: entretiens, error } = await supabase
      .from('entretiens')
      .select(`
        *,
        patients (
          id,
          civilites,
          nom,
          prenom,
          departement
        )
      `)
      .eq('status', 'finalise');

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
   
    const events = [];
   
    for (const entretien of entretiens) {
      try {
        if (!entretien.donnees_entretien) continue;
        
        const donneesEntretien = JSON.parse(entretien.donnees_entretien);
       
        // Chercher des dates dans l'entretien
        if (donneesEntretien.dateProchainRDV) {
          events.push({
            id: `entretien-${entretien.id}-prochain-rdv`,
            title: `Prochain RDV - ${entretien.patients.prenom} ${entretien.patients.nom}`,
            description: "Rendez-vous planifié lors d'un entretien",
            startDate: new Date(donneesEntretien.dateProchainRDV),
            endDate: new Date(new Date(donneesEntretien.dateProchainRDV).getTime() + 60*60*1000),
            allDay: false,
            eventType: "Rendez-vous planifié",
            status: "Planifié",
            patientId: entretien.patient_id,
            patient: entretien.patients,
            entretienId: entretien.id
          });
        }
       
      } catch (error) {
        console.error(`Erreur lors du traitement de l'entretien ${entretien.id}:`, error);
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