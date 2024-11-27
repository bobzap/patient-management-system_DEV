// app/api/lists/[listId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { listId: string } }
) {
  console.log('Début de la requête PUT - listId:', params.listId);
  
  try {
    const body = await request.text();
    console.log('Corps de la requête brut:', body);
    
    const data = JSON.parse(body);
    console.log('Données parsées:', data);

    const { items } = data;
    const { listId } = params;

    if (!items || !Array.isArray(items)) {
      console.error('Format de données invalide:', data);
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    const category = await prisma.listCategory.findUnique({
      where: { listId }
    });

    if (!category) {
      console.log('Catégorie non trouvée:', listId);
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    console.log('Catégorie trouvée:', category);

    // Supprimer les anciens items
    const deleteResult = await prisma.listItem.deleteMany({
      where: { categoryId: category.id }
    });
    console.log('Items supprimés:', deleteResult);

    // Créer les nouveaux items
    const createResult = await prisma.listItem.createMany({
      data: items.map((value: string, index: number) => ({
        value,
        order: index,
        categoryId: category.id
      }))
    });
    console.log('Nouveaux items créés:', createResult);

    // Récupérer la catégorie mise à jour
    const updatedCategory = await prisma.listCategory.findUnique({
      where: { listId },
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    console.log('Réponse finale:', updatedCategory);
    return NextResponse.json({ 
      success: true,
      data: updatedCategory 
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erreur serveur interne'
      },
      { status: 500 }
    );
  }
}