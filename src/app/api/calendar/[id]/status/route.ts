// src/app/api/calendar/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function PATCH(
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
   
    if (!data.status) {
      return NextResponse.json(
        { success: false, error: 'Statut non spécifié' },
        { status: 400 }
      );
    }
   
    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update({ status: data.status })
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
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}