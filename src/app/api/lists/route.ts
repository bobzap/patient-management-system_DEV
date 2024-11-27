// app/api/lists/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Récupération des listes...');
    
    const categories = await prisma.listCategory.findMany({
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    console.log(`Nombre de catégories trouvées: ${categories.length}`);
    console.log('Catégories:', JSON.stringify(categories, null, 2));
    
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des listes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des listes' },
      { status: 500 }
    );
  }
}