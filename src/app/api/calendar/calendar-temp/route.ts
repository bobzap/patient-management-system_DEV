// src/app/api/calendar-temp/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Stockage temporaire en mémoire
let mockEvents = [];
let nextId = 1;

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: mockEvents
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation de base
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données incomplètes' 
      }, { status: 400 });
    }
    
    console.log('Création événement avec données:', data);
    
    // Créer un nouvel événement
    const newEvent = {
      id: nextId++,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Ajouter à notre stockage
    mockEvents.push(newEvent);
    
    return NextResponse.json({
      success: true,
      data: newEvent
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la création de l\'événement',
      details: error.message 
    }, { status: 500 });
  }
}