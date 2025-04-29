// src/app/api/admin/execute-sql/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();
    console.log("Exécution SQL directe:", sql);
    
    // ATTENTION: Ceci est dangereux en production (injection SQL possible)
    // À utiliser uniquement pour déboguer/tester
    const result = await prisma.$executeRawUnsafe(sql);
    
    console.log("Résultat SQL:", result);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Erreur d'exécution SQL:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erreur d'exécution SQL",
      details: error.message
    }, { status: 500 });
  }
}