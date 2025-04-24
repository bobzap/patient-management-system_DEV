//src\app\api\lists\route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Début de la récupération des listes');
    
    // Vérifions d'abord les catégories sans les items
    const categoriesCount = await prisma.listCategory.count();
    console.log(`📊 Nombre total de catégories: ${categoriesCount}`);

    const categories = await prisma.listCategory.findMany({
      include: {
        items: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    console.log('📋 Détails des catégories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.listId}): ${cat.items.length} items`);
    });
    
    if (categories.length === 0) {
      console.warn('⚠️ Aucune catégorie trouvée dans la base de données');
    }
    
    return NextResponse.json({ 
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des listes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des listes' },
      { status: 500 }
    );
  }
}