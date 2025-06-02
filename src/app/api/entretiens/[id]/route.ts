// src/app/api/entretiens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    
    const { data: entretien, error } = await supabase
      .from('entretiens')
      .select(`
        *,
        patients (*)
      `)
      .eq('id', parseInt(params.id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Entretien non trouvé' }, { status: 404 });
      }
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Conversion snake_case → camelCase
    const formattedEntretien = {
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
      patient: entretien.patients,
      _hasData: !!entretien.donnees_entretien
    };

    return NextResponse.json({ success: true, data: formattedEntretien });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    console.log(`API entretiens - Mise à jour de l'entretien ${id}:`, data);
    
    // Récupérer l'entretien actuel
    const { data: currentEntretien, error: fetchError } = await supabase
      .from('entretiens')
      .select('*')
      .eq('id', Number(id))
      .single();
    
    if (fetchError || !currentEntretien) {
      return NextResponse.json({ error: "Entretien non trouvé" }, { status: 404 });
    }
    
    // Préparer les données pour la mise à jour
    const updateData: any = {
      donnees_entretien: typeof data.donneesEntretien === 'string'
        ? data.donneesEntretien
        : JSON.stringify(data.donneesEntretien),
      status: data.status,
      date_modification: new Date().toISOString()
    };
    
    // Si le statut change de brouillon à finalisé/archivé, figer le timer
    if (data.status !== 'brouillon' && currentEntretien.status === 'brouillon') {
      updateData.temps_fin = new Date().toISOString();
      updateData.en_pause = true;
    }
    
    // Mettre à jour l'entretien
    const { data: entretien, error } = await supabase
      .from('entretiens')
      .update(updateData)
      .eq('id', Number(id))
      .select(`
        *,
        patients (*)
      `)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Conversion pour le frontend
    const formattedEntretien = {
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
    };

    console.log(`API entretiens - Entretien ${id} mis à jour`);
    return NextResponse.json({ data: formattedEntretien });
  } catch (error) {
    console.error("API entretiens - Erreur de mise à jour:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entretien' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('entretiens')
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();
    console.log("API - Demande de PATCH pour pause forcée sur entretien:", id);
    
    // Récupérer l'entretien actuel
    const { data: currentEntretien, error: fetchError } = await supabase
      .from('entretiens')
      .select('*')
      .eq('id', Number(id))
      .single();
    
    if (fetchError || !currentEntretien) {
      return NextResponse.json({ error: "Entretien non trouvé" }, { status: 404 });
    }
    
    // Calculer le temps déjà écoulé (sans les pauses)
    const now = new Date();
    const debut = new Date(currentEntretien.temps_debut);
    let elapsedSeconds = Math.floor((now.getTime() - debut.getTime()) / 1000);
    
    // Soustraire le temps de pause existant
    if (currentEntretien.temps_pause) {
      elapsedSeconds -= currentEntretien.temps_pause;
    }
    
    // Si déjà en pause et qu'il y a une dernière pause, soustraire ce temps aussi
    if (currentEntretien.en_pause && currentEntretien.derniere_pause) {
      const dernierePause = new Date(currentEntretien.derniere_pause);
      const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
      elapsedSeconds -= pauseDuration;
    }
    
    // Mise à jour forcée : passer en pause et réinitialiser les temps de pause
    const updateData = {
      en_pause: true,
      derniere_pause: now.toISOString(),
      temps_pause: currentEntretien.temps_pause || 0,
      date_modification: now.toISOString()
    };
    
    console.log("PATCH - Mise à jour avec données:", updateData);
    
    // Mettre à jour l'entretien
    const { data: entretien, error } = await supabase
      .from('entretiens')
      .update(updateData)
      .eq('id', Number(id))
      .select('*')
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("PATCH - Entretien mis à jour avec succès:", {
      id: entretien.id,
      enPause: entretien.en_pause,
      dernierePause: entretien.derniere_pause,
      tempsPause: entretien.temps_pause
    });
    
    return NextResponse.json({ 
      success: true,
      data: entretien, 
      message: "Entretien mis en pause avec succès"
    });
  } catch (error) {
    console.error("API - erreur:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise en pause de l\'entretien' },
      { status: 500 }
    );
  }
}