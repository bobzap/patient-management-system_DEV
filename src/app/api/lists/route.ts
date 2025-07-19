//src\app\api\lists\route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET() {
  try {
    console.log('🔍 Début de la récupération des listes');
    
    const categories = await prisma.listCategory.findMany({
      include: {
        items: {
          orderBy: [
            { order: 'asc' },
            { value: 'asc' }
          ]
        }
      }
    });
    
    // Tri alphabétique automatique des items dans chaque catégorie
    const sortedCategories = categories.map(category => ({
      ...category,
      items: category.items.sort((a, b) => a.value.localeCompare(b.value, 'fr', { sensitivity: 'base' }))
    }));
    
    console.log('📋 Détails des catégories:');
    sortedCategories.forEach((cat: { name: string; listId: string; items: any[] }) => {
      console.log(`- ${cat.name} (${cat.listId}): ${cat.items.length} items`);
    });
    
    return NextResponse.json({ 
      success: true,
      data: sortedCategories,
      count: sortedCategories.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des listes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des listes' },
      { status: 500 }
    );
  }
}