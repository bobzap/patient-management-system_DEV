// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const data = await req.json();
    console.log('Données reçues:', data);

    // Insérer dans Supabase
    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        civilites: data.civilites,
        nom: data.nom,
        prenom: data.prenom,
        date_naissance: data.dateNaissance,
        age: data.age,
        etat_civil: data.etatCivil,
        poste: data.poste,
        numero_ligne: data.poste === 'Opérateur SB' ? data.numeroLigne : null,
        manager: data.manager,
        zone: data.zone,
        horaire: data.horaire || '',
        contrat: data.contrat,
        taux_activite: data.tauxActivite,
        departement: data.departement,
        date_entree: data.dateEntree,
        anciennete: data.anciennete,
        temps_trajet_aller: data.tempsTrajetAller,
        temps_trajet_retour: data.tempsTrajetRetour,
        type_transport: data.typeTransport,
        // Champs requis par le schéma
        date_creation: new Date().toISOString().split('T')[0],
        numero_entretien: 1,
        nom_entretien: '',
        date_entretien: '',
        heure_debut: '',
        heure_fin: '',
        duree: '',
        consentement: '',
        type_entretien: ''
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Patient créé:', patient);
    return NextResponse.json({ data: patient }, { status: 201 });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabase();

    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Formatage des dates (conversion snake_case → camelCase pour le frontend)
    const formattedPatients = patients.map((patient: any) => ({
      ...patient,
      // Conversion des noms de colonnes pour compatibilité
      dateNaissance: formatDate(patient.date_naissance),
      dateEntree: formatDate(patient.date_entree),
      dateEntretien: patient.date_entretien ? formatDate(patient.date_entretien) : '',
      dateCreation: formatDate(patient.date_creation),
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
    console.error('Erreur lors de la récupération des patients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}