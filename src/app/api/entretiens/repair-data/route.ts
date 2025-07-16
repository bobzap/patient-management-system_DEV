// src/app/api/entretiens/repair-data/route.ts - Réparation des données corrompues
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEntretienData, getDefaultEntretienData } from '@/utils/entretien-data';

export async function POST() {
  try {
    // Récupérer tous les entretiens
    const entretiens = await prisma.entretien.findMany({
      select: {
        id: true,
        numeroEntretien: true,
        status: true,
        donneesEntretien: true,
        patientId: true
      }
    });

    const repairs = [];
    let totalRepaired = 0;

    for (const entretien of entretiens) {
      const validation = validateEntretienData(entretien.donneesEntretien);
      
      if (!validation.isValid) {
        // Utiliser les données validées (ou par défaut si complètement corrompues)
        const repairedData = validation.data;
        
        try {
          await prisma.entretien.update({
            where: { id: entretien.id },
            data: {
              donneesEntretien: JSON.stringify(repairedData)
            }
          });

          repairs.push({
            id: entretien.id,
            numeroEntretien: entretien.numeroEntretien,
            errors: validation.errors,
            repaired: true
          });

          totalRepaired++;
        } catch (updateError) {
          repairs.push({
            id: entretien.id,
            numeroEntretien: entretien.numeroEntretien,
            errors: validation.errors,
            repaired: false,
            updateError: updateError instanceof Error ? updateError.message : String(updateError)
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalEntretiens: entretiens.length,
        totalRepaired,
        repairs
      }
    });

  } catch (error) {
    console.error('Erreur lors de la réparation des données:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la réparation des données'
    }, { status: 500 });
  }
}