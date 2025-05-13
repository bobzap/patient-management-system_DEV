// src/app/api/event-types/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un type d'événement spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const eventType = await prisma.eventType.findUnique({
      where: { id }
    });
    
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'Type d\'événement non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: eventType });
  } catch (error) {
    console.error('Erreur lors de la récupération du type d\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du type d\'événement' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un type d'événement
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validation des données
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du type d\'événement est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que le type d'événement existe
    const eventType = await prisma.eventType.findUnique({
      where: { id }
    });
    
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'Type d\'événement non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le nouveau nom n'existe pas déjà (sauf pour le même ID)
    if (data.name !== eventType.name) {
      const existing = await prisma.eventType.findFirst({
        where: { 
          name: data.name,
          id: { not: id }
        }
      });
      
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Un type d\'événement avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }
    
    // Mettre à jour le type d'événement
    const updatedEventType = await prisma.eventType.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color !== undefined ? data.color : eventType.color,
        icon: data.icon !== undefined ? data.icon : eventType.icon,
        active: data.active !== undefined ? data.active : eventType.active
      }
    });
    
    return NextResponse.json({ success: true, data: updatedEventType });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du type d\'événement' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un type d'événement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    // Vérifier que le type d'événement existe
    const eventType = await prisma.eventType.findUnique({
      where: { id }
    });
    
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'Type d\'événement non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si ce type est utilisé par des événements
    const eventsUsingType = await prisma.calendarEvent.findMany({
      where: {
        eventTypeIds: {
          contains: id.toString()
        }
      },
      take: 1 // On n'a besoin que de savoir s'il y en a au moins un
    });
    
    if (eventsUsingType.length > 0) {
      // Plutôt que de supprimer, on désactive ce type
      await prisma.eventType.update({
        where: { id },
        data: { active: false }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Le type d\'événement a été désactivé car il est utilisé par des événements existants' 
      });
    }
    
    // Supprimer le type d'événement
    await prisma.eventType.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Type d\'événement supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du type d\'événement' },
      { status: 500 }
    );
  }
}