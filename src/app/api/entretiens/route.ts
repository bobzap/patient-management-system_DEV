// src/app/api/entretiens/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Données entretien reçues:', data);

    const entretien = await prisma.entretien.create({
        data: {
          patientId: data.patientId,
          numeroEntretien: data.numeroEntretien,
          status: 'brouillon',
          isTemplate: false,
          donneesEntretien: data.donneesEntretien || {
            santeTravail: {
              vecuTravail: {
                motifVisite: {
                  motif: '',
                  commentaires: ''
                },
                postesOccupes: '',
                posteDeTravail: {
                  descriptionTaches: '',
                  risquesProfessionnels: '',
                  installationMateriel: ''
                },
                ressentiTravail: {
                  relationCollegues: 0,
                  relationHierarchie: 0,
                  stress: 0,
                  satisfaction: 0,
                  commentaires: ''
                },
                plaintesTravail: {
                  existence: false,
                  commentaires: ''
                }
              },
              modeVie: {
                loisirs: {
                  activitePhysique: false,
                  frequence: '',
                  commentaires: ''
                },
                addictions: {
                  tabac: {
                    consommation: false,
                    quantiteJour: '',
                    depuis: ''
                  },
                  medicaments: {
                    consommation: false,
                    depuis: '',
                    quantiteInfDix: false,
                    frequence: ''
                  },
                  alcool: {
                    consommation: false,
                    quantiteSupDix: false,
                    frequence: ''
                  },
                  cannabis: {
                    consommation: false,
                    depuis: '',
                    quantiteInfDix: false,
                    frequence: ''
                  },
                  droguesDures: {
                    consommation: false,
                    depuis: '',
                    frequence: ''
                  },
                  commentairesGeneraux: ''
                }
              }
            },
            examenClinique: {
              biometrie: {
                taille: '',
                poids: '',
                tension: '',
                pouls: '',
                temperature: '',
                glycemie: '',
                saturation: '',
                imc: ''
              },
              appareils: {
                yeuxAnnexes: {
                  bilanOPH: false,
                  commentairesORL: '',
                  commentairesOPH: ''
                },
                cardioPulmonaire: {
                  bilanCardio: false,
                  commentaires: ''
                },
                appareilDigestif: {
                  commentaires: ''
                },
                uroGenital: {
                  suiviGyneco: false,
                  commentaires: ''
                },
                osteoArticulaire: {
                  plainteEvoquee: false,
                  commentairesDouleurs: ''
                },
                neuroPsy: {
                  sommeilBon: false,
                  commentaires: ''
                },
                endocrinoMetabolisme: {
                  dernierBilan: ''
                }
              },
              antecedents: {
                medicaux: {
                  existence: false,
                  description: '',
                  commentaires: ''
                },
                chirurgicaux: {
                  existence: false,
                  description: '',
                  commentaires: ''
                }
              },
              traitements: {
                medicaments: {
                  existence: false,
                  description: '',
                  commentaires: ''
                },
                vaccination: {
                  aJour: false,
                  commentaires: ''
                }
              }
            },
            conclusion: {
              conseilsPrevention: {
                conseilsDonnes: '',
                troublesLiesTravail: []
              },
              limitationTravail: {
                existence: false,
                type: '',
                dureeJours: null,
                commentaires: ''
              },
              actions: {
                orientation: {
                  orientation: '',
                  commentaires: ''
                },
                etudePoste: {
                  aFaire: false,
                  commentaires: ''
                },
                manager: {
                  entretien: false,
                  managerDesigne: '',
                  commentaires: '',
                  dateRappel: ''
                },
                entretienInfirmier: {
                  aPrevoir: false,
                  dateRappel: ''
                },
                medecin: {
                  echangeNecessaire: false,
                  commentaires: ''
                },
                visiteMedicale: {
                  aPlanifier: false,
                  dateRappel: '',
                  commentaires: ''
                }
              }
            }
          }
        },
        include: {
          patient: true
        }
      });

    console.log('Entretien créé:', entretien);
    return NextResponse.json({ data: entretien }, { status: 201 });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'entretien' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const entretiens = await prisma.entretien.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        patient: true
      }
    });

    return NextResponse.json({ data: entretiens });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entretiens' },
      { status: 500 }
    );
  }
}