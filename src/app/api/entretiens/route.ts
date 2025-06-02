// src/app/api/entretiens/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST - Créer un entretien
export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const reqData = await req.json();
    console.log('API entretiens - Données de création reçues:', reqData);

    // Validation
    if (!reqData.patientId) {
      return NextResponse.json({ success: false, error: 'ID du patient requis' }, { status: 400 });
    }

    // Déterminer le numéro d'entretien
    let numeroEntretien = reqData.numeroEntretien || 1;
   
    if (!reqData.numeroEntretien) {
      // Trouver le nombre d'entretiens pour ce patient
      const { data: existingEntretiens, error: countError } = await supabase
        .from('entretiens')
        .select('numero_entretien')
        .eq('patient_id', reqData.patientId);

      if (countError) {
        console.error('Erreur lors du comptage des entretiens:', countError);
        return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
      }
     
      if (existingEntretiens && existingEntretiens.length > 0) {
        // Trouver le numéro le plus élevé et ajouter 1
        numeroEntretien = Math.max(...existingEntretiens.map((e: any) => e.numero_entretien)) + 1;
      }
    }

    // Préparer les données du timer
    const now = new Date();
    const timerData = {
      temps_debut: reqData.tempsDebut || now.toISOString(),
      en_pause: reqData.enPause || false,
      temps_pause: reqData.tempsPause || 0,
      derniere_pause: null
    };

    // Création de l'entretien avec données du timer
    const { data: nouvelEntretien, error } = await supabase
      .from('entretiens')
      .insert({
        patient_id: reqData.patientId,
        numero_entretien: numeroEntretien,
        status: reqData.status || 'brouillon',
        is_template: false,
        donnees_entretien: typeof reqData.donneesEntretien === 'string'
          ? reqData.donneesEntretien
          : JSON.stringify(reqData.donneesEntretien),
        ...timerData
      })
      .select(`
        *,
        patients (*)
      `)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`API entretiens - Entretien créé avec ID: ${nouvelEntretien.id}`);

    // Conversion snake_case → camelCase pour compatibilité frontend
    const formattedEntretien = {
      ...nouvelEntretien,
      patientId: nouvelEntretien.patient_id,
      numeroEntretien: nouvelEntretien.numero_entretien,
      dateCreation: nouvelEntretien.date_creation,
      dateModification: nouvelEntretien.date_modification,
      isTemplate: nouvelEntretien.is_template,
      baseEntretienId: nouvelEntretien.base_entretien_id,
      donneesEntretien: nouvelEntretien.donnees_entretien,
      tempsDebut: nouvelEntretien.temps_debut,
      tempsFin: nouvelEntretien.temps_fin,
      tempsPause: nouvelEntretien.temps_pause,
      enPause: nouvelEntretien.en_pause,
      dernierePause: nouvelEntretien.derniere_pause,
      patient: nouvelEntretien.patients
    };
   
    return NextResponse.json({
      success: true,
      data: formattedEntretien
    }, { status: 201 });

  } catch (error: any) {
    console.error('API entretiens - Erreur de création:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}

// GET - Récupérer tous les entretiens (si cette route existe)
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabase();
    
    // Récupérer tous les entretiens avec les patients
    const { data: entretiens, error } = await supabase
      .from('entretiens')
      .select(`
        *,
        patients (*)
      `)
      .order('date_creation', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Conversion snake_case → camelCase pour compatibilité frontend
    const formattedEntretiens = entretiens.map((entretien: any) => ({
      ...entretien,
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
      patient: entretien.patients
    }));

    return NextResponse.json({
      success: true,
      data: formattedEntretiens
    });

  } catch (error: any) {
    console.error('API entretiens - Erreur de récupération:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}