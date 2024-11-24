// app/api/patients/[id]/route.ts
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
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: patient });
  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
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
        // Informations personnelles
        civilite: data.civilite,
        nom: data.nom,
        prenom: data.prenom,
        dateNaissance: data.dateNaissance,
        age: parseInt(data.age),
        etatCivil: data.etatCivil,
        
        // Informations professionnelles
        poste: data.poste,
        manager: data.manager,
        zone: data.zone,
        horaire: data.horaire,
        contrat: data.contrat,
        tauxActivite: data.tauxActivite,
        departement: data.departement,
        dateEntree: data.dateEntree,
        anciennete: data.anciennete,

        // Informations de transport
        tempsTrajetAller: data.tempsTrajetAller,
        tempsTrajetRetour: data.tempsTrajetRetour,
        typeTransport: data.typeTransport,

        // Informations d'entretien
        numeroEntretien: data.numeroEntretien ? parseInt(data.numeroEntretien) : null,
        nomEntretien: data.nomEntretien,
        dateEntretien: data.dateEntretien,
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
        duree: data.duree,
        typeEntretien: data.typeEntretien,
        consentement: data.consentement,
      },
    });

    return NextResponse.json({ data: patient });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}