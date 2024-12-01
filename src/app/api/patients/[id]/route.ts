// app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { headers } from 'next/headers';
import { formatDate } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(params.id) }
    });
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ data: patient });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// UPDATE patient
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const patient = await prisma.patient.update({
      where: { id: parseInt(params.id) },
      data: {
        // Informations personnelles
        civilites: data.civilites,
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
        dateCreation: data.dateCreation || new Date().toISOString().split('T')[0],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: patient });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}
// DELETE patient
// app/api/patients/[id]/route.ts
// app/api/patients/[id]/route.ts


export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    await prisma.patient.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}