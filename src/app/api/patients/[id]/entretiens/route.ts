// src/app/api/patients/[id]/entretiens/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Fonction de formatage du statut
function getStatusStyle(status: string) {
  switch (status) {
    case 'finalise':
      return {
        label: 'Finalisé',
        className: 'bg-green-100 text-green-800'
      };
    case 'archive':
      return {
        label: 'Archivé',
        className: 'bg-gray-100 text-gray-800'
      };
    case 'brouillon':
    default:
      return {
        label: 'Brouillon',
        className: 'bg-yellow-100 text-yellow-800'
      };
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const patientId = parseInt(params.id);
   
    if (isNaN(patientId)) {
      return NextResponse.json({ success: false, error: 'ID patient invalide' }, { status: 400 });
    }

    // Récupérer les entretiens du patient depuis Supabase
    const { data: entretiens, error } = await supabase
      .from('entretiens')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_creation', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Conversion snake_case → camelCase et ajout des styles de statut
    const formattedEntretiens = entretiens.map((entretien: any) => ({
      ...entretien,
      // Conversion des noms de colonnes
      patientId: entretien.patient_id,
      numeroEntretien: entretien.numero_entretien,
      dateCreation: entretien.date_creation,
      dateModification: entretien.date_modification,
      isTemplate: entretien.is_template,
      baseEntretienId: entretien.base_entretien_id,
      donneesEntretien: entretien.donnees_entretien,
      tempsDebut: entretien.temps_debut,
      tempsFin: entretien.temps_fin,
      tempsPause: entretien.temps_pause,
      enPause: entretien.en_pause,
      dernierePause: entretien.derniere_pause,
      // Ajout du style de statut
      statusInfo: getStatusStyle(entretien.status)
    }));

    return NextResponse.json({
      success: true,
      data: formattedEntretiens
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entretiens:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}