// src/app/api/calendar/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Récupérer un événement spécifique
export async function GET(
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
    
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
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
    
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Événement non trouvé',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'événement',
      },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour un événement
export async function PUT(
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
    
    // Formatage des données pour la mise à jour
    const updateData: any = { ...data };
    
    // Conversion des dates si présentes
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }
    
    // Conversion des métadonnées en JSON si présentes
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata);
    }
    
    // Mise à jour de l'événement
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
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
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'événement',
      },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un événement
export async function DELETE(
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
    
    // Suppression de l'événement
    await prisma.calendarEvent.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de l\'événement',
      },
      { status: 500 }
    );
  }
}