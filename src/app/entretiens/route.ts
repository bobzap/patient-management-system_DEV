import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = parseInt(params.id);
    
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID patient invalide' }, { status: 400 });
    }

    // Vérifier si le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
    }

    // Récupérer les entretiens du patient
    const entretiens = await prisma.entretien.findMany({
      where: { patientId },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: entretiens
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entretiens:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}