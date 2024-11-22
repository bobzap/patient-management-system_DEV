import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const patient = await prisma.patient.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patient.delete({
      where: {
        id: parseInt(params.id),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}