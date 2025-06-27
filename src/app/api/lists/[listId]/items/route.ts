// src/app/api/lists/[listId]/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { listId } = params;
    const { value } = await request.json();

    if (!value || typeof value !== 'string' || !value.trim()) {
      return NextResponse.json(
        { error: 'La valeur du motif est requise' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    let category = await prisma.listCategory.findUnique({
      where: { listId }
    });

    // Si la catégorie n'existe pas, la créer
    if (!category) {
      // Déterminer le nom de la catégorie selon le listId
      const categoryNames: Record<string, string> = {
        'motifVisite': 'Motifs de visite',
        'typeEvent': 'Types d\'événement',
        // Ajouter d'autres mappings si nécessaire
      };

      category = await prisma.listCategory.create({
        data: {
          listId,
          name: categoryNames[listId] || `Liste ${listId}`
        }
      });
    }

    // Vérifier si l'item existe déjà
    const existingItem = await prisma.listItem.findUnique({
      where: {
        categoryId_value: {
          categoryId: category.id,
          value: value.trim()
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Cet élément existe déjà' },
        { status: 409 }
      );
    }

    // Obtenir le prochain ordre
    const lastItem = await prisma.listItem.findFirst({
      where: { categoryId: category.id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = (lastItem?.order || 0) + 1;

    // Créer le nouvel item
    const newItem = await prisma.listItem.create({
      data: {
        value: value.trim(),
        order: nextOrder,
        categoryId: category.id
      }
    });

    return NextResponse.json({
      success: true,
      data: newItem
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'élément:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}