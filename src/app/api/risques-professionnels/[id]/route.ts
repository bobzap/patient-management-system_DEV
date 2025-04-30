import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID non valide' },
        { status: 400 }
      );
    }
    
    const risque = await prisma.risqueProfessionnel.findUnique({
      where: { id }
    });
    
    if (!risque) {
      return NextResponse.json(
        { success: false, error: 'Risque non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: risque
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID non valide' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Vérifier si le risque existe
    const risque = await prisma.risqueProfessionnel.findUnique({
      where: { id }
    });
    
    if (!risque) {
      return NextResponse.json(
        { success: false, error: 'Risque non trouvé' },
        { status: 404 }
      );
    }
    
    // Mise à jour
    const updated = await prisma.risqueProfessionnel.update({
      where: { id },
      data: {
        nom: data.nom !== undefined ? data.nom : risque.nom,
        lien: data.lien !== undefined ? data.lien : risque.lien,
        estFavori: data.estFavori !== undefined ? data.estFavori : risque.estFavori
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID non valide' },
        { status: 400 }
      );
    }
    
    // Vérifier si le risque existe
    const risque = await prisma.risqueProfessionnel.findUnique({
      where: { id }
    });
    
    if (!risque) {
      return NextResponse.json(
        { success: false, error: 'Risque non trouvé' },
        { status: 404 }
      );
    }
    
    // Suppression
    await prisma.risqueProfessionnel.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Risque supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Route pour basculer le statut de favori
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID non valide' },
        { status: 400 }
      );
    }
    
    // Récupérer l'état actuel du risque
    const risque = await prisma.risqueProfessionnel.findUnique({
      where: { id }
    });
    
    if (!risque) {
      return NextResponse.json(
        { success: false, error: 'Risque non trouvé' },
        { status: 404 }
      );
    }
    
    // Basculer le statut de favori
    const updated = await prisma.risqueProfessionnel.update({
      where: { id },
      data: {
        estFavori: !risque.estFavori
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}