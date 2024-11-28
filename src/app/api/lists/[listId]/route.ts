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
    
    const { items } = JSON.parse(body);
    const { listId } = params;

    // Validation des données
    if (!items || !Array.isArray(items)) {
      console.error('Format de données invalide - items reçus:', items);
      return NextResponse.json(
        { error: 'Le format des données est invalide. Un tableau d\'items est requis.' },
        { status: 400 }
      );
    }

    // Mise à jour en une seule transaction
    const updatedCategory = await prisma.$transaction(async (tx) => {
      // Vérifier l'existence de la catégorie
      const category = await tx.listCategory.findUnique({
        where: { listId }
      });

      if (!category) {
        throw new Error(`Catégorie ${listId} non trouvée`);
      }

      // Supprimer les anciens items
      await tx.listItem.deleteMany({
        where: { categoryId: category.id }
      });

      // Créer les nouveaux items
      await tx.listItem.createMany({
        data: items.map((value: string, index: number) => ({
          value,
          order: index,
          categoryId: category.id
        }))
      });

      // Retourner la catégorie mise à jour avec ses items
      return tx.listCategory.findUnique({
        where: { listId },
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    if (!updatedCategory) {
      throw new Error('Échec de la mise à jour de la catégorie');
    }

    console.log('Mise à jour réussie:', {
      categoryId: updatedCategory.id,
      itemCount: updatedCategory.items.length
    });

    return NextResponse.json({ 
      success: true,
      data: updatedCategory,
      message: 'Liste mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    
    // Gestion spécifique des erreurs
    if (error.message.includes('non trouvée')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Une erreur est survenue lors de la mise à jour de la liste'
      },
      { status: 500 }
    );
  }
}

// Ajout de la méthode GET pour récupérer une liste spécifique
export async function GET(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { listId } = params;

    const category = await prisma.listCategory.findUnique({
      where: { listId },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Liste non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la liste' },
      { status: 500 }
    );
  }
}