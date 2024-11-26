// app/api/lists/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.listCategory.findMany({
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des listes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des listes' },
      { status: 500 }
    );
  }
}

// app/api/lists/[code]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { items } = await request.json();
    const { code } = params;

    // Récupérer la catégorie
    const category = await prisma.listCategory.findUnique({
      where: { code }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer les anciens éléments
    await prisma.listItem.deleteMany({
      where: { categoryId: category.id }
    });

    // Créer les nouveaux éléments
    await prisma.listItem.createMany({
      data: items.map((value: string, index: number) => ({
        value,
        order: index,
        categoryId: category.id
      }))
    });

    // Récupérer la catégorie mise à jour
    const updatedCategory = await prisma.listCategory.findUnique({
      where: { code },
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ data: updatedCategory });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la liste' },
      { status: 500 }
    );
  }
}