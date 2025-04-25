// src/app/api/entretiens/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const reqData = await req.json();
    console.log('Données reçues:', reqData);

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
        numeroEntretien = Math.max(...existingEntretiens.map(e => e.numeroEntretien)) + 1;
      }
    }

    // Création de l'entretien
    const nouvelEntretien = await prisma.entretien.create({
      data: {
        patientId: reqData.patientId,
        numeroEntretien: numeroEntretien,
        status: reqData.status || 'brouillon',
        isTemplate: false,
        donneesEntretien: typeof reqData.donneesEntretien === 'string'
          ? reqData.donneesEntretien
          : JSON.stringify(reqData.donneesEntretien)
      },
      include: {
        patient: true
      }
    });

    return NextResponse.json({
      success: true,
      data: nouvelEntretien
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur détaillée:', error);
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
      data: entretiens
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