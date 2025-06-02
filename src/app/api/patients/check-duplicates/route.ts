// src/app/api/patients/check-duplicates/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nomQuery = url.searchParams.get('nom');
 
  if (!nomQuery) {
    return NextResponse.json({ error: 'Paramètre nom requis' }, { status: 400 });
  }
 
  try {
    const supabase = createServerSupabase();
    
    // Recherche insensible à la casse avec PostgreSQL
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .ilike('nom', `%${nomQuery}%`) // ilike = insensible à la casse
      .order('nom', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Conversion snake_case → camelCase pour compatibilité frontend
    const formattedPatients = patients.map((patient: any) => ({
      ...patient,
      dateNaissance: patient.date_naissance,
      dateEntree: patient.date_entree,
      dateEntretien: patient.date_entretien,
      dateCreation: patient.date_creation,
      etatCivil: patient.etat_civil,
      numeroLigne: patient.numero_ligne,
      tauxActivite: patient.taux_activite,
      tempsTrajetAller: patient.temps_trajet_aller,
      tempsTrajetRetour: patient.temps_trajet_retour,
      typeTransport: patient.type_transport,
      numeroEntretien: patient.numero_entretien,
      nomEntretien: patient.nom_entretien,
      heureDebut: patient.heure_debut,
      heureFin: patient.heure_fin,
      typeEntretien: patient.type_entretien,
      createdAt: patient.created_at,
      updatedAt: patient.date_modification
    }));
   
    return NextResponse.json({ data: formattedPatients });
  } catch (error) {
    console.error('Erreur lors de la recherche de doublons:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de doublons' },
      { status: 500 }
    );
  }
}