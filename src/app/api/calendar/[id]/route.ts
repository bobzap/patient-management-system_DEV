// src/app/api/calendar/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            civilites: true,
            nom: true,
            prenom: true,
            departement: true
          }
        },
        entretien: true
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'événement' },
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
    const body = await request.json();
    
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
    
    // Conversion des dates
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }
    
    // Conversion des IDs
    if (body.patientId) {
      body.patientId = parseInt(body.patientId);
    }
    
    if (body.entretienId) {
      body.entretienId = parseInt(body.entretienId);
    }
    
    // Mise à jour de l'événement
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: body
    });
    
    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'événement' },
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
    
    // Supprimer l'événement
    await prisma.calendarEvent.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    );
  }
}