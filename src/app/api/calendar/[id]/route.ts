// src/app/api/calendar/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const { data: event, error } = await supabase
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
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Événement non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Conversion snake_case → camelCase
    const formattedEvent = {
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
    };
    
    return NextResponse.json({
      success: true,
      data: formattedEvent,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Formatage des données pour la mise à jour
    const updateData: any = {};
    
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate) updateData.start_date = new Date(data.startDate).toISOString();
    if (data.endDate) updateData.end_date = new Date(data.endDate).toISOString();
    if (data.allDay !== undefined) updateData.all_day = data.allDay;
    if (data.status) updateData.status = data.status;
    if (data.patientId !== undefined) updateData.patient_id = data.patientId;
    if (data.entretienId !== undefined) updateData.entretien_id = data.entretienId;
    if (data.eventType) updateData.event_type_string = data.eventType;
    if (data.metadata) updateData.metadata = JSON.stringify(data.metadata);
    if (data.createdBy !== undefined) updateData.created_by = data.createdBy;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;
    if (data.parentEventId !== undefined) updateData.parent_event_id = data.parentEventId;
    
    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Événement non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Conversion pour le frontend
    const formattedEvent = {
      ...updatedEvent,
      startDate: updatedEvent.start_date,
      endDate: updatedEvent.end_date,
      allDay: updatedEvent.all_day,
      eventTypeString: updatedEvent.event_type_string,
      patientId: updatedEvent.patient_id,
      entretienId: updatedEvent.entretien_id,
      createdAt: updatedEvent.created_at,
      updatedAt: updatedEvent.date_modification,
      createdBy: updatedEvent.created_by,
      parentEventId: updatedEvent.parent_event_id,
      patient: updatedEvent.patients
    };
    
    return NextResponse.json({
      success: true,
      data: formattedEvent,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}