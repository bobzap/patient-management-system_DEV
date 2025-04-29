// src/app/api/entretiens/force-pause/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const entretienId = params.id;
  
  if (!entretienId) {
    return NextResponse.json({ error: 'ID entretien requis' }, { status: 400 });
  }
  
  try {
    console.log("Force-pause - ID entretien:", entretienId);
    
    // Mise à jour directe et explicite
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "Entretien"
      SET "enPause" = true, 
          "dernierePause" = CURRENT_TIMESTAMP
      WHERE "id" = ${parseInt(entretienId)}
    `);
    
    console.log("Force-pause - Résultat:", result);
    
    return NextResponse.json({ 
      success: true,
      message: "Entretien mis en pause avec succès" 
    });
  } catch (error) {
    console.error("Force-pause - Erreur:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors de la mise en pause forcée"
    }, { status: 500 });
  }
}