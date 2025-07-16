// src/app/api/entretiens/[id]/elapsed-time/route.ts - Sauvegarde du temps écoulé
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entretienId = parseInt(id);
   
    if (!entretienId) {
      return NextResponse.json({ error: 'ID entretien requis' }, { status: 400 });
    }
   
    const { elapsedSeconds } = await request.json();
    
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds < 0) {
      return NextResponse.json({ error: 'Temps écoulé invalide' }, { status: 400 });
    }
     
    // Récupérer l'entretien actuel
    const entretien = await prisma.entretien.findUnique({
      where: { id: entretienId }
    });
     
    if (!entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }
     
    // Vérifier si l'entretien est un brouillon
    if (entretien.status !== 'brouillon') {
      return NextResponse.json({
        success: false,
        error: 'Impossible de mettre à jour le temps d\'un entretien finalisé'
      }, { status: 400 });
    }
    
    // Calculer le nouveau temps de fin basé sur le temps écoulé
    const tempsDebut = entretien.tempsDebut ? new Date(entretien.tempsDebut) : new Date();
    // tempsFin représente le temps de début + temps écoulé réel (sans les pauses)
    const tempsFin = new Date(tempsDebut.getTime() + (elapsedSeconds * 1000));
     
    // Mettre à jour l'entretien avec le nouveau temps de fin
    const updatedEntretien = await prisma.entretien.update({
      where: { id: entretienId },
      data: {
        tempsFin: tempsFin,
        // Optionnel : sauvegarder le temps écoulé dans les métadonnées
        donneesEntretien: entretien.donneesEntretien ? 
          (() => {
            try {
              const data = JSON.parse(entretien.donneesEntretien);
              return JSON.stringify({ ...data, elapsedSeconds });
            } catch {
              return JSON.stringify({ elapsedSeconds });
            }
          })() : 
          JSON.stringify({ elapsedSeconds })
      }
    });
     
    return NextResponse.json({
      success: true,
      data: {
        elapsedSeconds,
        tempsFin: updatedEntretien.tempsFin
      }
    });
     
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du temps écoulé:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la sauvegarde du temps écoulé'
    }, { status: 500 });
  }
}