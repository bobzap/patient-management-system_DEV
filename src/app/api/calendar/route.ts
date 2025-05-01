// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Récupérer des événements du calendrier avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    
    // Construction de la requête avec filtres
    const query: any = {};
    
    // Filtre par date
    if (startDate && endDate) {
      query.OR = [
        // Événements qui commencent dans la période
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        // Événements qui finissent dans la période
        {
          endDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        // Événements qui englobent la période
        {
          AND: [
            { startDate: { lte: new Date(startDate) } },
            { endDate: { gte: new Date(endDate) } },
          ],
        },
      ];
    }
    
    // Filtre par type d'événement
    if (eventType) {
      query.eventType = eventType;
    }
    
    // Filtre par statut
    if (status) {
      query.status = status;
    }
    
    // Exécution de la requête avec inclusion des données de patient
    const events = await prisma.calendarEvent.findMany({
      where: query,
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
      orderBy: {
        startDate: 'asc',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des événements',
      },
      { status: 500 }
    );
  }
}

// POST: Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation basique des données
    if (!data.title || !data.startDate || !data.endDate || !data.eventType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données incomplètes',
        },
        { status: 400 }
      );
    }
    
    // Formatage des dates
    const event = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      // S'assurer que le statut par défaut est "planifie" s'il n'est pas fourni
      status: data.status || 'planifie',
      // Conversion en JSON pour les métadonnées si présentes
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    };
    
    const newEvent = await prisma.calendarEvent.create({
      data: event,
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
      data: newEvent,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'événement',
      },
      { status: 500 }
    );
  }
}