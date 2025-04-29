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
    
    // Récupérer l'entretien actuel pour calculer correctement le temps de pause
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(entretienId) }
    });
    
    if (!entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }
    
    // Préparer les données à mettre à jour
    let updateData: any = {
      enPause: data.enPause
    };
    
    const now = new Date();
    
    // Si on met en pause
    if (data.enPause && !entretien.enPause) {
      updateData.dernierePause = now;
    }
    
    // Si on sort de la pause
    if (!data.enPause && entretien.enPause && entretien.dernierePause) {
      // Calculer la durée de la pause
      const dernierePause = new Date(entretien.dernierePause);
      const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
      
      // Mettre à jour le temps total de pause
      updateData.tempsPause = (entretien.tempsPause || 0) + pauseDuration;
      updateData.dernierePause = null;
    }
    
    // Mise à jour de l'entretien
    const updatedEntretien = await prisma.entretien.update({
      where: { id: parseInt(entretienId) },
      data: updateData
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedEntretien 
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du timer:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du timer' 
    }, { status: 500 });
  }
}