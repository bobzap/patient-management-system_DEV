// src/app/api/entretiens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// ✅ CORRIGÉ : await params
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 API GET: Chargement entretien ID ${id}`);
    
    const entretien = await prisma.entretien.findUnique({
      where: { id: parseInt(id) },
      include: { patient: true }
    });
    
    if (!entretien) {
      console.log(`❌ API GET: Entretien ${id} non trouvé`);
      return NextResponse.json({ success: false, error: 'Entretien non trouvé' }, { status: 404 });
    }

    console.log(`✅ API GET: Entretien trouvé:`, {
      id: entretien.id,
      numeroEntretien: entretien.numeroEntretien,
      status: entretien.status,
      donneesEntretienType: typeof entretien.donneesEntretien,
      donneesEntretienLength: entretien.donneesEntretien?.length || 0,
      donneesEntretienPreview: entretien.donneesEntretien?.substring(0, 100) + '...'
    });

    return NextResponse.json({ success: true, data: entretien });
  } catch (error) {
    console.error(`💥 API GET: Erreur:`, error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// ✅ CORRIGÉ : Utilise params au lieu d'extraire de l'URL
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await request.json();
    console.log(`🔍 API entretiens - Mise à jour de l'entretien ${id}`);
    console.log(`📝 Données reçues:`, JSON.stringify(data, null, 2));
    
    // Récupérer l'entretien actuel
    const currentEntretien = await prisma.entretien.findUnique({
      where: { id: Number(id) }
    });
    
    if (!currentEntretien) {
      console.log(`❌ Entretien ${id} non trouvé`);
      return NextResponse.json({ error: "Entretien non trouvé" }, { status: 404 });
    }
    
    // 🔧 AMÉLIORATION : Meilleure gestion des données
    let donneesEntretienString = '';
    if (data.donneesEntretien) {
      donneesEntretienString = typeof data.donneesEntretien === 'string'
        ? data.donneesEntretien
        : JSON.stringify(data.donneesEntretien);
    } else {
      donneesEntretienString = currentEntretien.donneesEntretien || '{}';
    }
    
    console.log(`📦 Données à sauvegarder (taille: ${donneesEntretienString.length} caractères)`);
    
    // Préparer les données pour la mise à jour
    const updateData: any = {
      donneesEntretien: donneesEntretienString,
      status: data.status || currentEntretien.status,
      dateModification: new Date()
    };
    
    // Si le statut change de brouillon à finalisé/archivé, figer le timer
    if (data.status !== 'brouillon' && currentEntretien.status === 'brouillon') {
      updateData.tempsFin = new Date();
      updateData.enPause = true;
    }
    
    console.log(`🔄 Données de mise à jour:`, updateData);
    
    // Mettre à jour l'entretien
    const entretien = await prisma.entretien.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        patient: true
      }
    });

    console.log(`✅ Entretien ${id} mis à jour avec succès`);
    return NextResponse.json({ success: true, data: entretien });
  } catch (error) {
    console.error("❌ API entretiens - Erreur de mise à jour:", error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'entretien' },
      { status: 500 }
    );
  }
}

// ✅ CORRIGÉ : Utilise params au lieu d'extraire de l'URL
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params

    await prisma.entretien.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

// ✅ CORRIGÉ : await params
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params

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