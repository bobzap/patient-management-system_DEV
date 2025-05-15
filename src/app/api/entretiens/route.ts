// src/app/api/entretiens/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';


// src/app/api/entretiens/route.ts - Fonction POST pour créer un entretien

export async function POST(req: Request) {
  try {
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
      const existingEntretiens = await prisma.entretien.findMany({
        where: { patientId: reqData.patientId },
        select: { numeroEntretien: true }
      });
      
      if (existingEntretiens.length > 0) {
        // Trouver le numéro le plus élevé et ajouter 1
        numeroEntretien = Math.max(...existingEntretiens.map((e: {numeroEntretien: number}) => e.numeroEntretien)) + 1;
      }
    }

    // Préparer les données du timer
    const now = new Date();
    const timerData = {
      tempsDebut: reqData.tempsDebut || now.toISOString(),
      enPause: reqData.enPause || false,
      tempsPause: reqData.tempsPause || 0,
      dernierePause: null
    };

    // Création de l'entretien avec données du timer
    const nouvelEntretien = await prisma.entretien.create({
      data: {
        patientId: reqData.patientId,
        numeroEntretien: numeroEntretien,
        status: reqData.status || 'brouillon',
        isTemplate: false,
        donneesEntretien: typeof reqData.donneesEntretien === 'string'
          ? reqData.donneesEntretien
          : JSON.stringify(reqData.donneesEntretien),
        ...timerData
      },
      include: {
        patient: true
      }
    });

    console.log(`API entretiens - Entretien créé avec ID: ${nouvelEntretien.id}`);
    
    return NextResponse.json({
      success: true,
      data: nouvelEntretien
    }, { status: 201 });

  } catch (error: any) {
    console.error('API entretiens - Erreur de création:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    
    
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        patient: true
      }
    });
    
    if (!entretien) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }

    
    console.log('API: donneesEntretien (début):', 
      typeof entretien.donneesEntretien === 'string'
        ? entretien.donneesEntretien.substring(0, 100) + '...'
        : JSON.stringify(entretien.donneesEntretien).substring(0, 100) + '...'
    );


    return NextResponse.json({
  success: true,
  data: entretien  // Utilisez la variable qui existe
});

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération'
    }, {
      status: 500
    });
  }
}