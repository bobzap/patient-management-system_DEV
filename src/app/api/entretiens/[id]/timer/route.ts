// src/app/api/entretiens/[id]/timer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// src/app/api/entretiens/[id]/timer/route.ts

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const entretienId = params.id;
  
  if (!entretienId) {
    return NextResponse.json({ error: 'ID entretien requis' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    console.log("API timer - données reçues:", { entretienId, data });
    
    // Récupérer l'entretien actuel
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(entretienId) }
    });
    
    if (!entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }
    
    console.log("État actuel de l'entretien:", {
      id: entretien.id,
      status: entretien.status,
      enPause: entretien.enPause,
      dernierePause: entretien.dernierePause,
      tempsPause: entretien.tempsPause
    });
    
    // Préparer les données à mettre à jour
    const updateData: any = {};
    const now = new Date();
    
    // Gestion du changement d'état de pause
    if (data.enPause !== undefined) {
      // Si on demande de mettre en pause et que ce n'est pas déjà le cas
      if (data.enPause && !entretien.enPause) {
        console.log("Mise en pause du timer");
        updateData.enPause = true;
        updateData.dernierePause = now;
      }
      // Si on demande de sortir de pause et que c'est actuellement en pause
      else if (!data.enPause && entretien.enPause) {
        console.log("Sortie de pause du timer");
        updateData.enPause = false;
        
        // Calculer le temps de pause si dernierePause existe
        if (entretien.dernierePause) {
          const dernierePause = new Date(entretien.dernierePause);
          const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
          
          // Ajouter au temps de pause total
          updateData.tempsPause = (entretien.tempsPause || 0) + pauseDuration;
          updateData.dernierePause = null;
        }
      }
      // Si on demande de mettre en pause et c'est déjà le cas (redondant, mais peut être utile)
      else if (data.enPause && entretien.enPause) {
        console.log("Timer déjà en pause, mise à jour du temps");
        // Assurons-nous que dernierePause est à jour
        updateData.dernierePause = now;
      }
    }
    
    // Si pas de changements à faire, créer au moins une mise à jour minimale
    if (Object.keys(updateData).length === 0) {
      console.log("Aucun changement d'état détecté, appliquant une mise à jour minimale");
      // Mettre à jour la date de dernière modification pour confirmer la mise à jour
      updateData.dateModification = now;
    }
    
    console.log("Mise à jour avec les données:", updateData);
    
    // Mise à jour de l'entretien
    const updatedEntretien = await prisma.entretien.update({
      where: { id: parseInt(entretienId) },
      data: updateData
    });
    
    console.log("Entretien mis à jour avec succès:", {
      id: updatedEntretien.id,
      enPause: updatedEntretien.enPause,
      dernierePause: updatedEntretien.dernierePause,
      tempsPause: updatedEntretien.tempsPause
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedEntretien 
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du timer:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du timer',
      details: error.message 
    }, { status: 500 });
  }
}