// src/app/api/entretiens/check-data/route.ts - Vérification de l'intégrité des données
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEntretienData } from '@/utils/entretien-data';

export async function GET() {
  try {
    // Récupérer tous les entretiens
    const entretiens = await prisma.entretien.findMany({
      select: {
        id: true,
        numeroEntretien: true,
        status: true,
        donneesEntretien: true,
        patientId: true,
        tempsDebut: true,
        tempsFin: true,
        tempsPause: true,
        enPause: true,
        dernierePause: true
      }
    });

    const results = [];
    let totalErrors = 0;

    for (const entretien of entretiens) {
      const validation = validateEntretienData(entretien.donneesEntretien);
      
      const result = {
        id: entretien.id,
        numeroEntretien: entretien.numeroEntretien,
        status: entretien.status,
        patientId: entretien.patientId,
        isValid: validation.isValid,
        errors: validation.errors,
        timerData: {
          tempsDebut: entretien.tempsDebut,
          tempsFin: entretien.tempsFin,
          tempsPause: entretien.tempsPause,
          enPause: entretien.enPause,
          dernierePause: entretien.dernierePause
        }
      };

      if (!validation.isValid) {
        totalErrors++;
        results.push(result);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalEntretiens: entretiens.length,
        totalErrors,
        errorRate: totalErrors / entretiens.length,
        problematicEntretiens: results
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification des données:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification des données'
    }, { status: 500 });
  }
}