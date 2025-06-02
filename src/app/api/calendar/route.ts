// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

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
  
  return colorMap[type] || '#71717a';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    
    // Construction de la requête avec filtres
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        patients (
          id,
          civilites,
          nom,
          prenom,
          departement
        )
      `)
      .order('start_date', { ascending: true });
    
    // Filtre par date
    if (startDate && endDate) {
      query = query.or(`start_date.gte.${startDate},end_date.gte.${startDate},and(start_date.lte.${startDate},end_date.gte.${endDate})`);
    }
    
    // Filtre par type d'événement
    if (eventType) {
      query = query.eq('event_type_string', eventType);
    }
    
    // Filtre par statut
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: events, error } = await query;
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Conversion snake_case → camelCase pour compatibilité frontend
    const formattedEvents = events.map((event: any) => ({
      ...event,
      startDate: event.start_date,
      endDate: event.end_date,
      allDay: event.all_day,
      eventTypeString: event.event_type_string,
      patientId: event.patient_id,
      entretienId: event.entretien_id,
      createdAt: event.created_at,
      updatedAt: event.date_modification,
      createdBy: event.created_by,
      parentEventId: event.parent_event_id,
      patient: event.patients
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur lors de la récupération des événements:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des événements',
        details: err.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    
    // Validation basique des données
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { success: false, error: 'Données incomplètes' },
        { status: 400 }
      );
    }
    
    console.log('Données reçues pour création d\'événement:', data);
    
    // Formatage des données pour Supabase
    const eventData = {
      title: data.title,
      description: data.description || null,
      start_date: new Date(data.startDate).toISOString(),
      end_date: new Date(data.endDate).toISOString(),
      all_day: data.allDay || false,
      status: data.status || 'planifie',
      patient_id: data.patientId || null,
      entretien_id: data.entretienId || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      event_type_string: typeof data.eventType === 'string' ? data.eventType : null,
      created_by: data.createdBy || null,
      recurrence: data.recurrence || null,
      parent_event_id: data.parentEventId || null
    };
    
    // Création de l'événement en base de données
    const { data: newEvent, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select(`
        *,
        patients (
          id,
          civilites,
          nom,
          prenom,
          departement
        )
      `)
      .single();
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Gestion des types d'événements (si nécessaire)
    if (data.eventType && typeof data.eventType === 'string') {
      const eventTypeNames = data.eventType.split(',').map((type: string) => type.trim());
      
      for (const typeName of eventTypeNames) {
        // Créer ou récupérer le type d'événement
        const { error: typeError } = await supabase
          .from('event_types')
          .upsert({
            name: typeName,
            color: getDefaultColorForEventType(typeName)
          });
        
        if (typeError) {
          console.warn('Erreur lors de la création du type d\'événement:', typeError);
        }
        
        // Créer la liaison many-to-many
        const { error: linkError } = await supabase
          .from('event_type_calendar_event')
          .insert({
            event_type_id: typeName, // Utiliser le nom comme référence temporaire
            calendar_event_id: newEvent.id
          });
        
        if (linkError) {
          console.warn('Erreur lors de la liaison avec le type d\'événement:', linkError);
        }
      }
    }

    // Conversion pour le frontend
    const formattedEvent = {
      ...newEvent,
      startDate: newEvent.start_date,
      endDate: newEvent.end_date,
      allDay: newEvent.all_day,
      eventTypeString: newEvent.event_type_string,
      patientId: newEvent.patient_id,
      entretienId: newEvent.entretien_id,
      createdAt: newEvent.created_at,
      updatedAt: newEvent.date_modification,
      createdBy: newEvent.created_by,
      parentEventId: newEvent.parent_event_id,
      patient: newEvent.patients
    };
    
    return NextResponse.json({
      success: true,
      data: formattedEvent,
    });
  } catch (error) {
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