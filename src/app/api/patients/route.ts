import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log("patients",patients)
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const patient = await prisma.patient.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}