// src/app/api/entretiens/[id]/timer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.log(`API timer - Mise à jour pour entretien ${entretienId}:`, data);
    
    // Récupérer l'entretien actuel
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(entretienId) }
    });
    
    if (!entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }
    
    // Vérifier si l'entretien est finalisé ou archivé
    if (entretien.status !== 'brouillon') {
      // On ne modifie pas l'état du timer pour un entretien finalisé ou archivé
      return NextResponse.json({ 
        success: false, 
        error: 'Impossible de modifier le timer d\'un entretien finalisé ou archivé' 
      }, { status: 400 });
    }
    
    // Préparer les données à mettre à jour
    const updateData: any = {};
    const now = new Date();
    
    // Gestion du changement d'état de pause
    if (data.enPause !== undefined && data.enPause !== entretien.enPause) {
      updateData.enPause = data.enPause;
      
      // Si on met en pause
      if (data.enPause) {
        console.log(`API timer - Mise en pause de l'entretien ${entretienId}`);
        updateData.dernierePause = now;
      }
      // Si on sort de la pause
      else if (entretien.dernierePause) {
        console.log(`API timer - Sortie de pause de l'entretien ${entretienId}`);
        // Calculer la durée de la pause
        const dernierePause = new Date(entretien.dernierePause);
        const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
        
        // Mettre à jour le temps total de pause
        updateData.tempsPause = (entretien.tempsPause || 0) + pauseDuration;
        updateData.dernierePause = null;
      }
    }
    
    // Si le statut change à finalisé ou archivé, figer le timer
    if (data.status && data.status !== 'brouillon' && entretien.status === 'brouillon') {
      console.log(`API timer - Finalisation de l'entretien ${entretienId}`);
      updateData.tempsFin = now;
      updateData.enPause = true;
    }
    
    // Si aucune mise à jour n'est nécessaire
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: entretien,
        message: "Aucune modification nécessaire"
      });
    }
    
    // Mise à jour de l'entretien
    const updatedEntretien = await prisma.entretien.update({
      where: { id: parseInt(entretienId) },
      data: updateData
    });
    
    console.log(`API timer - Entretien ${entretienId} mis à jour:`, {
      enPause: updatedEntretien.enPause,
      dernierePause: updatedEntretien.dernierePause,
      tempsPause: updatedEntretien.tempsPause
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedEntretien 
    });
    
  } catch (error) {
    console.error('API timer - Erreur:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du timer'
    }, { status: 500 });
  }
}