// src/app/api/entretienData/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTempData } from '@/lib/tempEntretienData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entretienId = parseInt(params.id);
    console.log(`API EntretienData: Tentative de récupération pour ID: ${entretienId}`);
    
    const data = getTempData(entretienId);
    console.log(`API EntretienData: Données trouvées? ${!!data}`);
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données non disponibles' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('API EntretienData: Erreur:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}