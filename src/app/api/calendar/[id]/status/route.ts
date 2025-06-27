// src/app/api/calendar/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Mettre à jour uniquement le statut d'un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID invalide',
        },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Vérifier que le statut est fourni
    if (!data.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Statut non spécifié',
        },
        { status: 400 }
      );
    }
    
    // Vérification que l'événement existe
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Événement non trouvé',
        },
        { status: 404 }
      );
    }
    
    // Mise à jour du statut
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        status: data.status,
        // Mise à jour de la date de modification
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            civilites: true,
            nom: true,
            prenom: true,
            departement: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
      },
      { status: 500 }
    );
  }
}