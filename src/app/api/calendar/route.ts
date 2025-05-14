// src/app/api/calendar/route.ts - version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Définition de l'interface
interface EventCreateData {
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  status: string;
  patientId: string | null;
  metadata: string | null;
  eventTypeString: string | null;
  eventTypes?: {
    connectOrCreate: Array<{
      where: { name: string };
      create: { name: string; color: string };
    }>;
  };
}


// Ajouter cette fonction helper pour attribuer une couleur par défaut
function getDefaultColorForEventType(type: string): string {
  const colorMap: {[key: string]: string} = {
    'Entretien Infirmier': '#3b82f6',
    'Visite Médicale': '#22c55e',
    'Rappel Médical': '#eab308',
    'Étude de Poste': '#a855f7',
    'Entretien Manager': '#6366f1',
    'Limitation de Travail': '#ef4444',
    'Suivi Post-AT': '#f97316',
    'Vaccination': '#14b8a6',
    'Formation': '#ec4899'
  };
  
  return colorMap[type] || '#71717a'; // Gris par défaut
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    
    console.log('Prisma instance:', prisma); // Débogage
    console.log('Paramètres de requête:', { startDate, endDate, eventType, status }); // Débogage
    
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
    
    // Vérifier si le modèle calendarEvent existe dans prisma
    if (!prisma.calendarEvent) {
      console.error('Le modèle CalendarEvent n\'existe pas dans l\'instance Prisma');
      return NextResponse.json({
        success: true,
        data: [], // Retourner un tableau vide en attendant que le modèle soit créé
        message: 'CalendarEvent model not found'
      });
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
  } catch (error: unknown) {
  const err = error as Error;
  console.error('Erreur lors de la création de l\'événement:', err);
  return NextResponse.json(
    {
      success: false,
      error: 'Erreur lors de la création de l\'événement',
      details: err.message
    },
    { status: 500 }
  );
}
}


export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation basique des données
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { success: false, error: 'Données incomplètes' },
        { status: 400 }
      );
    }
    
    console.log('Données reçues pour création d\'événement:', data);
    
    // Solution temporaire si le modèle CalendarEvent n'est pas encore disponible
    if (!prisma.calendarEvent) {
      console.warn('Modèle CalendarEvent non disponible, retournant une réponse factice');
      
      // Retourner une réponse factice pour permettre le développement de l'interface
      return NextResponse.json({
        success: true,
        data: {
          id: Math.floor(Math.random() * 1000) + 1, // ID aléatoire
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // Formatage des dates
    const eventData = {
      title: data.title,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      allDay: data.allDay || false,
      status: data.status || 'Planifié',
      patientId: data.patientId || null,
      // Conversion en JSON pour les métadonnées si présentes
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      // Stocker aussi dans eventTypeString pour rétrocompatibilité
      eventTypeString: typeof data.eventType === 'string' ? data.eventType : null,
    };
    
    // Traiter les types d'événements
    let createData: EventCreateData = {
  ...eventData
};
    
    // Si eventType est fourni, créer les liens avec la table EventType
    if (data.eventType) {
  let eventTypeNames: string[] = [];
  
  if (typeof data.eventType === 'string') {
    eventTypeNames = data.eventType.split(',').map((type: string) => type.trim());
  } else if (Array.isArray(data.eventType)) {
    eventTypeNames = data.eventType as string[];
  }
  
  if (eventTypeNames.length > 0) {
    createData.eventTypes = {
      connectOrCreate: eventTypeNames.map((name: string) => ({
        where: { name },
        create: { 
          name,
          color: getDefaultColorForEventType(name)
        }
      }))
    };
  }
}
    
    
    // Création de l'événement en base de données
    const newEvent = await prisma.calendarEvent.create({
      data: createData,
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
        eventTypes: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
  const err = error as Error;
  console.error('Erreur lors de la récupération des événements:', err);
  return NextResponse.json(
    { 
      success: false, 
      error: 'Erreur lors de la récupération des événements',
      message: err.message 
    },
    { status: 500 }
  );
}
}