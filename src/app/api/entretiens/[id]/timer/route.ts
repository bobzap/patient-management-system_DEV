// src/app/api/entretiens/[id]/timer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const entretienId = params.id;
 
  if (!entretienId) {
    return NextResponse.json({ error: 'ID entretien requis' }, { status: 400 });
  }
 
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
   
    // Récupérer l'entretien actuel
    const { data: entretien, error: fetchError } = await supabase
      .from('entretiens')
      .select('*')
      .eq('id', parseInt(entretienId))
      .single();
   
    if (fetchError || !entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }
   
    // Vérifier si l'entretien est finalisé ou archivé
    if (entretien.status !== 'brouillon') {
      return NextResponse.json({
        success: false,
        error: 'Impossible de modifier le timer d\'un entretien finalisé ou archivé'
      }, { status: 400 });
    }
   
    // Préparer les données à mettre à jour
    const updateData: any = {};
    const now = new Date();
   
    // Gérer le changement d'état de pause
    if (data.enPause !== undefined && data.enPause !== entretien.en_pause) {
      updateData.en_pause = data.enPause;
     
      // Si on met en pause
      if (data.enPause) {
        updateData.derniere_pause = now.toISOString();
      }
      // Si on sort de la pause
      else if (entretien.derniere_pause) {
        // Calculer la durée de la pause
        const dernierePause = new Date(entretien.derniere_pause);
        const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
       
        // Mettre à jour le temps total de pause
        updateData.temps_pause = (entretien.temps_pause || 0) + pauseDuration;
        updateData.derniere_pause = null;
      }
    }
   
    // Mise à jour de l'entretien
    const { data: updatedEntretien, error } = await supabase
      .from('entretiens')
      .update(updateData)
      .eq('id', parseInt(entretienId))
      .select('*')
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Conversion pour le frontend
    const formattedEntretien = {
      ...updatedEntretien,
      patientId: updatedEntretien.patient_id,
      numeroEntretien: updatedEntretien.numero_entretien,
      dateCreation: updatedEntretien.date_creation,
      dateModification: updatedEntretien.date_modification,
      isTemplate: updatedEntretien.is_template,
      baseEntretienId: updatedEntretien.base_entretien_id,
      donneesEntretien: updatedEntretien.donnees_entretien,
      tempsDebut: updatedEntretien.temps_debut,
      tempsFin: updatedEntretien.temps_fin,
      tempsPause: updatedEntretien.temps_pause,
      enPause: updatedEntretien.en_pause,
      dernierePause: updatedEntretien.derniere_pause
    };
   
    return NextResponse.json({
      success: true,
      data: formattedEntretien
    });
   
  } catch (error) {
    console.error('API timer - Erreur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour du timer'
    }, { status: 500 });
  }
}