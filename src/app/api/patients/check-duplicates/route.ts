import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nomQuery = url.searchParams.get('nom');
  
  if (!nomQuery) {
    return NextResponse.json({ error: 'Paramètre nom requis' }, { status: 400 });
  }
  
  try {
    // Pour SQLite, nous utilisons contains sans le mode insensitive
    // et normalisons les entrées en minuscules pour une recherche insensible à la casse
    const nomQueryLower = nomQuery.toLowerCase();
    
    // Récupérer tous les patients
    const allPatients = await prisma.patient.findMany({
      orderBy: {
        nom: 'asc'
      }
    });
    
    // Filtrer manuellement pour une recherche insensible à la casse
    const patients = allPatients.filter(patient => 
      patient.nom.toLowerCase().includes(nomQueryLower)
    ).slice(0, 5); // Limiter à 5 résultats
    
    return NextResponse.json({ data: patients });
  } catch (error) {
    console.error('Erreur lors de la recherche de doublons:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de doublons' },
      { status: 500 }
    );
  }
}