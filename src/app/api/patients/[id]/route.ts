// src/app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', parseInt(params.id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
      }
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Conversion snake_case → camelCase pour compatibilité frontend
    const formattedPatient = {
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
    };

    return NextResponse.json({ data: formattedPatient });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// UPDATE patient
export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    console.log("6. API - données reçues:", { id, data });

    const { data: patient, error } = await supabase
      .from('patients')
      .update({
        // Informations personnelles
        civilites: data.civilites,
        nom: data.nom,
        prenom: data.prenom,
        date_naissance: data.dateNaissance,
        age: parseInt(data.age),
        etat_civil: data.etatCivil,
        
        // Informations professionnelles
        poste: data.poste,
        numero_ligne: data.poste === 'Opérateur SB' ? data.numeroLigne : null,
        manager: data.manager,
        zone: data.zone,
        horaire: data.horaire,
        contrat: data.contrat,
        taux_activite: data.tauxActivite,
        departement: data.departement,
        date_entree: data.dateEntree,
        anciennete: data.anciennete,
        
        // Informations de transport
        temps_trajet_aller: data.tempsTrajetAller,
        temps_trajet_retour: data.tempsTrajetRetour,
        type_transport: data.typeTransport,
        
        // Informations d'entretien
        numero_entretien: data.numeroEntretien ? parseInt(data.numeroEntretien) : null,
        nom_entretien: data.nomEntretien,
        date_entretien: data.dateEntretien,
        heure_debut: data.heureDebut,
        heure_fin: data.heureFin,
        duree: data.duree,
        type_entretien: data.typeEntretien,
        consentement: data.consentement,
        date_creation: data.dateCreation || new Date().toISOString().split('T')[0],
        date_modification: new Date().toISOString(),
      })
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("7. API - patient mis à jour:", patient);
    
    // Conversion pour le frontend
    const formattedPatient = {
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
    };

    return NextResponse.json({ data: formattedPatient });
  } catch (error) {
    console.error("8. API - erreur:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}

// DELETE patient
export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}