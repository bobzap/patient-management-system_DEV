// src/app/api/entretiens/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const reqText = await req.text();
    const reqData = JSON.parse(reqText);
    console.log('Données reçues:', reqData);

    // Validation
    if (!reqData.patientId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'ID du patient requis'
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Création de l'entretien avec conversion en string des données
    const nouvelEntretien = await prisma.entretien.create({
      data: {
        patientId: reqData.patientId,
        numeroEntretien: reqData.numeroEntretien || 1,
        status: 'brouillon',
        isTemplate: false,
        donneesEntretien: JSON.stringify(reqData.donneesEntretien) // Conversion en string
      },
      include: {
        patient: true
      }
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: nouvelEntretien
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('Erreur détaillée:', error);
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur serveur'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}



export async function GET() {
  try {
    const entretiens = await prisma.entretien.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        patient: true
      }
    });

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