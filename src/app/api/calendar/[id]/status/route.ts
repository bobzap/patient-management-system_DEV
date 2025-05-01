// src/app/api/calendar/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH: Modifier uniquement le statut d'un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    // Vérifier si le nouveau statut est fourni
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Statut non fourni' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'événement existe
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour uniquement le statut
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: { status: body.status }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedEvent,
      message: `Statut mis à jour: ${body.status}`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}