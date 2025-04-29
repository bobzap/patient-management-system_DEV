// src/app/api/admin/pause-entretien/[id]/route.ts

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
    console.log("API pause-entretien - Mise en pause forcée de l'entretien:", entretienId);
    
    // Mise à jour directe avec $executeRaw pour s'assurer qu'elle est appliquée
    const result = await prisma.$executeRaw`
      UPDATE "Entretien"
      SET "enPause" = true, 
          "dernierePause" = CURRENT_TIMESTAMP
      WHERE "id" = ${parseInt(entretienId)}
    `;
    
    console.log("Résultat de la mise à jour:", result);
    
    return NextResponse.json({ 
      success: true, 
      message: "Entretien mis en pause avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la mise en pause:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors de la mise en pause",
      details: error.message 
    }, { status: 500 });
  }
}