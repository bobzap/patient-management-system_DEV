import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Récupérer les risques, avec les favoris en premier
    const risques = await prisma.risqueProfessionnel.findMany({
      orderBy: [
        { estFavori: 'desc' }, // Favoris en premier
        { nom: 'asc' } // Puis par ordre alphabétique
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: risques
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des risques professionnels:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validation
    if (!data.nom || !data.lien) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le lien sont requis' },
        { status: 400 }
      );
    }
    
    // Création du risque
    const risque = await prisma.risqueProfessionnel.create({
      data: {
        nom: data.nom,
        lien: data.lien,
        estFavori: data.estFavori || false
      }
    });
    
    return NextResponse.json({
      success: true,
      data: risque
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du risque professionnel:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}