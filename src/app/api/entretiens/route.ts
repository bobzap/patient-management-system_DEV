import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Fonction POST pour créer un entretien
export async function POST(req: Request) {
  try {
    const reqData = await req.json();
    
    
    // Validation
    if (!reqData.patientId) {
      return NextResponse.json({ success: false, error: 'ID du patient requis' }, { status: 400 });
    }
    
    // Déterminer le numéro d'entretien
    let numeroEntretien = reqData.numeroEntretien || 1;
   
    if (!reqData.numeroEntretien) {
      // Trouver le nombre d'entretiens pour ce patient
      const existingEntretiens = await prisma.entretien.findMany({
        where: { patientId: reqData.patientId },
        select: { numeroEntretien: true }
      });
     
      if (existingEntretiens.length > 0) {
        numeroEntretien = Math.max(...existingEntretiens.map((e: {numeroEntretien: number}) => e.numeroEntretien)) + 1;
      }
    }
    
    // Préparer les données du timer
    const now = new Date();
    const timerData = {
      tempsDebut: reqData.tempsDebut || now.toISOString(),
      enPause: reqData.enPause || false,
      tempsPause: reqData.tempsPause || 0,
      dernierePause: null
    };
    
    // 🔧 CORRECTION : Bien sérialiser les données
    let donneesEntretienString = '';
    if (reqData.donneesEntretien) {
      donneesEntretienString = typeof reqData.donneesEntretien === 'string'
        ? reqData.donneesEntretien
        : JSON.stringify(reqData.donneesEntretien);
    } else {
      donneesEntretienString = JSON.stringify({});
    }
    
    // Création de l'entretien avec données du timer
    const nouvelEntretien = await prisma.entretien.create({
      data: {
        patientId: reqData.patientId,
        numeroEntretien: numeroEntretien,
        status: reqData.status || 'brouillon',
        isTemplate: false,
        donneesEntretien: donneesEntretienString, // 🔧 CORRECTION
        ...timerData
      },
      include: {
        patient: true
      }
    });
    
    
   
    return NextResponse.json({
      success: true,
      data: nouvelEntretien
    }, { status: 201 });
  } catch (error: any) {
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}

// 🔧 CORRECTION : Supprimer la fonction GET incorrecte
// Cette route ne devrait avoir que POST pour créer
// La fonction GET individuelle est dans [id]/route.ts