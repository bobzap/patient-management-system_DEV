// src/app/api/entretiens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(params.id) },
      include: { patient: true }
    });
    
    if (!entretien) {
      return NextResponse.json({ success: false, error: 'Entretien non trouvé' }, { status: 404 });
    }

    // Utilisez une méthode ultra-directe pour stocker/accéder aux données
    if (typeof entretien.donneesEntretien === 'string') {
      try {
        // Parser les données
        const parsedData = JSON.parse(entretien.donneesEntretien);
        // Les stocker dans notre système temporaire
        //setTempData(entretien.id, parsedData);
        // Ajouter un flag indiquant que nous avons des données
        entretien._hasData = true;
      } catch (error) {
        console.error('Erreur parsing:', error);
        entretien._hasData = false;
      }
    }

    return NextResponse.json({ success: true, data: entretien });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// src/app/api/entretiens/[id]/route.ts - Fonction PUT pour mettre à jour un entretien

export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    const data = await request.json();
    console.log(`API entretiens - Mise à jour de l'entretien ${id}:`, data);
    
    // Récupérer l'entretien actuel
    const currentEntretien = await prisma.entretien.findUnique({
      where: { id: Number(id) }
    });
    
    if (!currentEntretien) {
      return NextResponse.json({ error: "Entretien non trouvé" }, { status: 404 });
    }
    
    // Préparer les données pour la mise à jour
    const updateData: any = {
      donneesEntretien: typeof data.donneesEntretien === 'string'
        ? data.donneesEntretien
        : JSON.stringify(data.donneesEntretien),
      status: data.status,
      dateModification: new Date()
    };
    
    // Si le statut change de brouillon à finalisé/archivé, figer le timer
    if (data.status !== 'brouillon' && currentEntretien.status === 'brouillon') {
      updateData.tempsFin = new Date();
      updateData.enPause = true;
    }
    
    // Mettre à jour l'entretien
    const entretien = await prisma.entretien.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        patient: true
      }
    });

    console.log(`API entretiens - Entretien ${id} mis à jour`);
    return NextResponse.json({ data: entretien });
  } catch (error) {
    console.error("API entretiens - Erreur de mise à jour:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entretien' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    await prisma.entretien.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "ID non trouvé" }, { status: 400 });
  }

  try {
    console.log("API - Demande de PATCH pour pause forcée sur entretien:", id);
    
    // Récupérer l'entretien actuel
    const currentEntretien = await prisma.entretien.findUnique({
      where: { id: Number(id) }
    });
    
    if (!currentEntretien) {
      return NextResponse.json({ error: "Entretien non trouvé" }, { status: 404 });
    }
    
    // Calculer le temps déjà écoulé (sans les pauses)
    const now = new Date();
    const debut = new Date(currentEntretien.tempsDebut);
    let elapsedSeconds = Math.floor((now.getTime() - debut.getTime()) / 1000);
    
    // Soustraire le temps de pause existant
    if (currentEntretien.tempsPause) {
      elapsedSeconds -= currentEntretien.tempsPause;
    }
    
    // Si déjà en pause et qu'il y a une dernière pause, soustraire ce temps aussi
    if (currentEntretien.enPause && currentEntretien.dernierePause) {
      const dernierePause = new Date(currentEntretien.dernierePause);
      const pauseDuration = Math.floor((now.getTime() - dernierePause.getTime()) / 1000);
      elapsedSeconds -= pauseDuration;
    }
    
    // Mise à jour forcée : passer en pause et réinitialiser les temps de pause
    const updateData = {
      enPause: true,
      dernierePause: now,
      tempsPause: currentEntretien.tempsPause || 0,
      dateModification: now
    };
    
    console.log("PATCH - Mise à jour avec données:", updateData);
    
    // Mettre à jour l'entretien
    const entretien = await prisma.entretien.update({
      where: { id: Number(id) },
      data: updateData
    });

    console.log("PATCH - Entretien mis à jour avec succès:", {
      id: entretien.id,
      enPause: entretien.enPause,
      dernierePause: entretien.dernierePause,
      tempsPause: entretien.tempsPause
    });
    
    return NextResponse.json({ 
      success: true,
      data: entretien, 
      message: "Entretien mis en pause avec succès"
    });
  } catch (error) {
    console.error("API - erreur:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise en pause de l\'entretien' },
      { status: 500 }
    );
  }
}