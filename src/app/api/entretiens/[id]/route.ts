// src/app/api/entretiens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Modifiez src/app/api/entretiens/[id]/route.ts pour simplifier
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API: Récupération de l'entretien ID: ${params.id}`);
    
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        patient: true
      }
    });
    
    if (!entretien) {
      return NextResponse.json({ 
        success: false, 
        error: 'Entretien non trouvé' 
      }, { status: 404 });
    }

    console.log(`API: Entretien trouvé ID: ${entretien.id}`);

    // On renvoie les données sans les transformer
    return NextResponse.json({ 
      success: true,
      data: entretien
    });
  } catch (error) {
    console.error('API: Erreur:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 });
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
    
    const entretien = await prisma.entretien.update({
      where: { id: Number(id) },
      data: {
        donneesEntretien: data.donneesEntretien,
        status: data.status,
        dateModification: new Date()
      },
      include: {
        patient: true
      }
    });

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