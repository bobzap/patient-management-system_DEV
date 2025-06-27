// src/app/api/calendar-temp/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Pour permettre d'autres propriétés
}

// Stockage temporaire en mémoire avec le type correct
let mockEvents: CalendarEvent[] = [];
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
  const err = error as Error;
  
  return NextResponse.json({
    success: false,
    error: 'Erreur lors de la création de l\'événement',
    details: err.message
  }, { status: 500 });
}
}