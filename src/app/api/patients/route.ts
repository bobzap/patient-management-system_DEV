// app/api/patients/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Données reçues:', data);

    const patient = await prisma.patient.create({
      data: {
        civilite: data.civilite,
        nom: data.nom,
        prenom: data.prenom,
        dateNaissance: new Date(data.dateNaissance),
        age: parseInt(data.age),
        etatCivil: data.etatCivil,
        poste: data.poste,
        manager: data.manager,
        zone: data.zone,
        horaire: data.horaire || '',
        contrat: data.contrat,
        tauxActivite: data.tauxActivite,
        departement: data.departement,
        dateEntree: new Date(data.dateEntree),
        anciennete: data.anciennete,
        tempsTrajetAller: data.tempsTrajetAller,
        tempsTrajetRetour: data.tempsTrajetRetour,
        typeTransport: data.typeTransport,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Patient créé:', patient);
    return NextResponse.json({ data: patient }, { status: 201 });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: patients });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}