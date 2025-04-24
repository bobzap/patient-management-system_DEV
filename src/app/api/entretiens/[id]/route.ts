// src/app/api/entretiens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { setTempData } from '@/lib/tempEntretienData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(params.id) },
      include: { patient: true }
    });
    
    if (!entretien) {
      return NextResponse.json({ success: false, error: 'Entretien non trouvé' }, { status: 404 });
    }

    // Utilisez une méthode ultra-directe pour stocker/accéder aux données
    if (typeof entretien.donneesEntretien === 'string') {
      try {
        // Parser les données
        const parsedData = JSON.parse(entretien.donneesEntretien);
        // Les stocker dans notre système temporaire
        setTempData(entretien.id, parsedData);
        // Ajouter un flag indiquant que nous avons des données
        entretien._hasData = true;
      } catch (error) {
        console.error('Erreur parsing:', error);
        entretien._hasData = false;
      }
    }

    return NextResponse.json({ success: true, data: entretien });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const data = await request.json();
    console.log("API - données entretien reçues:", { id, data });
    
    // Vérifier si donneesEntretien est déjà une chaîne
    let donneesEntretien = data.donneesEntretien;
    if (typeof donneesEntretien !== 'string') {
      console.log("API - conversion des données en chaîne JSON");
      donneesEntretien = JSON.stringify(donneesEntretien);
    } else {
      console.log("API - données déjà au format chaîne JSON");
    }
    
    const entretien = await prisma.entretien.update({
      where: { id: Number(id) },
      data: {
        donneesEntretien: donneesEntretien,
        status: data.status,
        dateModification: new Date()
      },
      include: {
        patient: true
      }
    });

    console.log("API - entretien mis à jour avec succès:", entretien.id);
    return NextResponse.json({ data: entretien });
  } catch (error) {
    console.error("API - erreur:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entretien' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    await prisma.entretien.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}