// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Récupérer tous les événements du calendrier avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const skip = (page - 1) * pageSize;
    
    // Paramètres de filtre
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const patientId = searchParams.get('patientId');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    
    // Construction des filtres
    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.startDate = { gte: new Date(startDate) };
      whereClause.endDate = { lte: new Date(endDate) };
    } else if (startDate) {
      whereClause.startDate = { gte: new Date(startDate) };
    } else if (endDate) {
      whereClause.endDate = { lte: new Date(endDate) };
    }
    
    if (patientId) {
      whereClause.patientId = parseInt(patientId);
    }
    
    if (eventType) {
      whereClause.eventType = eventType;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    // Récupérer les événements
    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            civilites: true,
            nom: true,
            prenom: true,
            departement: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: { startDate: 'asc' }
    });
    
    // Compter le nombre total d'événements (pour la pagination)
    const totalEvents = await prisma.calendarEvent.count({ where: whereClause });
    
    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        total: totalEvents,
        page,
        pageSize,
        totalPages: Math.ceil(totalEvents / pageSize)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

// POST: Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des champs obligatoires
    if (!body.title || !body.startDate || !body.endDate || !body.eventType) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }
    
    // Conversion des dates
    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);
    
    // Conversion des IDs
    if (body.patientId) {
      body.patientId = parseInt(body.patientId);
    }
    
    if (body.entretienId) {
      body.entretienId = parseInt(body.entretienId);
    }
    
    // Création de l'événement
    const newEvent = await prisma.calendarEvent.create({
      data: body
    });
    
    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}