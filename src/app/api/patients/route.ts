//src\app\api\patients\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { formatDate } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Données reçues:', data);

    const patient = await prisma.patient.create({
      data: {
        civilites: data.civilites,
        nom: data.nom,
        prenom: data.prenom,
        dateNaissance: data.dateNaissance,
        age: data.age,
        etatCivil: data.etatCivil,
        poste: data.poste,
        numeroLigne: data.poste === 'Opérateur SB' ? data.numeroLigne : null,
        manager: data.manager,
        zone: data.zone,
        horaire: data.horaire || '',
        contrat: data.contrat,
        tauxActivite: data.tauxActivite,
        departement: data.departement,
        dateEntree: data.dateEntree,
        anciennete: data.anciennete,
        tempsTrajetAller: data.tempsTrajetAller,
        tempsTrajetRetour: data.tempsTrajetRetour,
        typeTransport: data.typeTransport,
        // Champs requis par le schéma
        dateCreation: new Date().toISOString().split('T')[0],
        numeroEntretien: 1,
        nomEntretien: '',
        dateEntretien: '',
        heureDebut: '',
        heureFin: '',
        duree: '',
        consentement: '',
        typeEntretien: ''
      }
    });

    console.log('Patient créé:', patient);
    return NextResponse.json({ data: patient }, { status: 201 });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedPatients = patients.map(patient => ({
      ...patient,
      dateNaissance: formatDate(patient.dateNaissance),
      dateEntree: formatDate(patient.dateEntree),
      dateEntretien: patient.dateEntretien ? formatDate(patient.dateEntretien) : '',
      dateCreation: formatDate(patient.dateCreation)
    }));

    return NextResponse.json({ data: formattedPatients });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}