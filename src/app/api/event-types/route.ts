// src/app/api/event-types/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les types d'événements
export async function GET() {
  try {
    const eventTypes = await prisma.eventType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({ success: true, data: eventTypes });
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des types d\'événement' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau type d'événement
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validation des données
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du type d\'événement est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que le nom n'existe pas déjà
    const existing = await prisma.eventType.findFirst({
      where: { name: data.name }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un type d\'événement avec ce nom existe déjà' },
        { status: 400 }
      );
    }
    
    // Créer le nouveau type d'événement
    const eventType = await prisma.eventType.create({
      data: {
        name: data.name,
        color: data.color || '#3b82f6',
        icon: data.icon,
        active: data.active !== undefined ? data.active : true
      }
    });
    
    return NextResponse.json({ success: true, data: eventType });
  } catch (error) {
    console.error('Erreur lors de la création du type d\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du type d\'événement' },
      { status: 500 }
    );
  }
}