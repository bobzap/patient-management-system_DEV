//src\app\api\patients\[id]\entretiens\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fonction de formatage du statut
function getStatusStyle(status: string) {
  switch (status) {
    case 'finalise':
      return {
        label: 'Finalisé',
        className: 'bg-green-100 text-green-800'
      };
    case 'archive':
      return {
        label: 'Archivé',
        className: 'bg-gray-100 text-gray-800'
      };
    case 'brouillon':
    default:
      return {
        label: 'Brouillon',
        className: 'bg-yellow-100 text-yellow-800'
      };
  }
}

// Une seule fonction GET
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = parseInt(params.id);
    
    console.log(`Récupération des entretiens pour le patient ID: ${patientId}`);
    
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID patient invalide' }, { status: 400 });
    }

    // Récupérer les entretiens du patient
    const entretiens = await prisma.entretien.findMany({
      where: { patientId },
      orderBy: { dateCreation: 'desc' },
    });

    console.log(`Nombre d'entretiens trouvés: ${entretiens.length}`);

    // Ajouter les styles de statut
    const formattedEntretiens = entretiens.map(entretien => ({
      ...entretien,
      statusInfo: getStatusStyle(entretien.status)
    }));

    return NextResponse.json({
      success: true,
      data: formattedEntretiens
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entretiens:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}