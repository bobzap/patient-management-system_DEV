model Entretien {
  id              Int       @id @default(autoincrement())
  patient         Patient   @relation(fields: [patientId], references: [id])
  patientId       Int
  numeroEntretien Int

  // Structure commune
  dateCreation    DateTime  @default(now())
  dateModification DateTime @updatedAt
  status          String    @default("brouillon")
  isTemplate      Boolean   @default(false)
  baseEntretienId Int?
  
  // Données des sections
  donneesEntretien Json    
  
  
    {
      // SANTÉ AU TRAVAIL
      santeTravail: {
        vecuTravail: {
          motifVisite: {
            motif: String,
            commentaires: String
          },
          postesOccupes: String,
          posteDeTravail: {
            descriptionTaches: String,
            risquesProfessionnels: String,
            installationMateriel: String
          },
          ressentiTravail: {
            relationCollegues: Number,
            relationHierarchie: Number,
            stress: Number,
            satisfaction: Number,
            commentaires: String
          },
          plaintesTravail: {
            existence: Boolean,
            commentaires: String
          }
        },
        modeVie: {
          loisirs: {
            activitePhysique: Boolean,
            frequence: String,
            commentaires: String
          },
          addictions: {
            tabac: {
              consommation: Boolean,
              quantiteJour: String,
              depuis: String
            },
            medicaments: {
              consommation: Boolean,
              depuis: String,
              quantiteInfDix: Boolean,
              frequence: String
            },
            alcool: {
              consommation: Boolean,
              quantiteSupDix: Boolean,
              frequence: String
            },
            cannabis: {
              consommation: Boolean,
              depuis: String,
              quantiteInfDix: Boolean,
              frequence: String
            },
            droguesDures: {
              consommation: Boolean,
              depuis: String,
              frequence: String
            },
            commentairesGeneraux: String
          }
        }
      },

      // EXAMEN CLINIQUE
      examenClinique: {
        biometrie: {
          taille: String,
          poids: String,
          tension: String,
          pouls: String,
          temperature: String,
          glycemie: String,
          saturation: String,
          imc: String
        },
        appareils: {
          yeuxAnnexes: {
            bilanOPH: Boolean,
            commentairesORL: String,
            commentairesOPH: String
          },
          cardioPulmonaire: {
            bilanCardio: Boolean,
            commentaires: String
          },
          appareilDigestif: {
            commentaires: String
          },
          uroGenital: {
            suiviGyneco: Boolean,
            commentaires: String
          },
          osteoArticulaire: {
            plainteEvoquee: Boolean,
            commentairesDouleurs: String
          },
          neuroPsy: {
            sommeilBon: Boolean,
            commentaires: String
          },
          endocrinoMetabolisme: {
            dernierBilan: String
          }
        },
        antecedents: {
          medicaux: {
            existence: Boolean,
            description: String,
            commentaires: String
          },
          chirurgicaux: {
            existence: Boolean,
            description: String,
            commentaires: String
          }
        },
        traitements: {
          medicaments: {
            existence: Boolean,
            description: String,
            commentaires: String
          },
          vaccination: {
            aJour: Boolean,
            commentaires: String
          }
        }
      },

      // CONCLUSION
      conclusion: {
        conseilsPrevention: {
          conseilsDonnes: String,
          troublesLiesTravail: String[]
        },
        limitationTravail: {
          existence: Boolean,
          type: String,
          dureeJours: Int?,
          commentaires: String
        },
        actions: {
          orientation: {
            orientation: String,
            commentaires: String
          },
          etudePoste: {
            aFaire: Boolean,
            commentaires: String
          },
          manager: {
            entretien: Boolean,
            managerDesigne: String,
            commentaires: String,
            dateRappel: String
          },
          entretienInfirmier: {
            aPrevoir: Boolean,
            dateRappel: String
          },
          medecin: {
            echangeNecessaire: Boolean,
            commentaires: String
          },
          visiteMedicale: {
            aPlanifier: Boolean,
            dateRappel: String,
            commentaires: String
          }
        }
      }
    }
  
}





CONTEXTE DU PROJET
Ce projet est un logiciel de gestion d'entretiens infirmiers. Il permet de :
- Gérer les dossiers patients (CRUD complet)
- Réaliser des entretiens infirmiers structurés en 4 sections
- Administrer les listes et formulaires via une interface dédiée
- [À venir] Personnaliser les formulaires via un FormBuilder

STRUCTURE ACTUELLE
Arborescence principale :
src/
├── app/
│   ├── admin/
│   │   └── page.tsx
│   ├── api/
│   │   ├── lists/
│   │   └── patients/
│   └── layout.tsx
├── components/
│   ├── admin/
│   ├── entretiens/
│   │   ├── EntretienForm/
│   │   └── sections/
│   └── patients/
└── prisma/
    └── schema.prisma

DERNIÈRES IMPLÉMENTATIONS
1. CRUD complet des patients avec :
   - Interface de création/modification
   - Gestion des notifications
   - Système de navigation

2. Nouveau modèle Entretien avec structure JSON pour :
   - Santé au travail (Vécu + Mode de vie)
   - Examen clinique
   - IMAA
   - Conclusion

POINTS EN ATTENTE
1. Développement des composants pour EntretienForm
2. Implémentation du FormBuilder
3. Système de templates d'entretiens
4. Gestion des droits utilisateurs

ROADMAP PROPOSÉE
Phase 1 - En cours
- Finaliser l'interface EntretienForm
- Implémenter la sauvegarde des entretiens

Phase 2 
- Développer le FormBuilder
- Ajouter la personnalisation des champs

Phase 3
- Système de reporting
- Export des données

OPTIMISATIONS IDENTIFIÉES
1. Gestion des redirections après actions CRUD
2. Persistance des notifications lors des changements de page
3. Performance du chargement des listes
4. Cache des données fréquemment utilisées

QUESTIONS POUR LA SUITE
1. Quelle partie de l'EntretienForm développer en premier ?
2. Faut-il implémenter le FormBuilder progressivement ou en une fois ?
3. Comment gérer la validation des formulaires d'entretien ?
4. Quelle stratégie pour les tests ?


RECOMMANDATIONS DE DÉVELOPPEMENT
1. Méthodologie
   - Toujours demander avant d'implémenter du code complet
   - Proposer d'abord la structure/logique avant implémentation
   - Procéder par étapes progressives
   - Valider chaque étape avant de passer à la suivante

2. Organisation du Code
   - Toujours préciser le fichier et son chemin complet
   - Indiquer les imports nécessaires
   - Ajouter des commentaires aux endroits stratégiques
   - Signaler les dépendances avec d'autres composants

3. Communication
   - Demander les fichiers existants avant modification
   - Expliquer le raisonnement derrière les choix techniques
   - Proposer des alternatives quand pertinent
   - Signaler les impacts potentiels sur d'autres parties du code

4. Bonnes Pratiques
   - Vérifier la cohérence avec l'architecture existante
   - Privilégier la réutilisation des composants
   - Garder en tête les futures fonctionnalités (FormBuilder)
   - Maintenir une structure modulaire

5. Gestion Base de Données et Persistance
   - Toujours vérifier la cohérence avec le schéma Prisma
   - Signaler si des migrations sont nécessaires
   - Tester les requêtes Prisma avant implémentation complète
   - Vérifier les relations entre modèles

6. Suivi des Fonctionnalités
   - Indiquer clairement le statut d'une fonctionnalité :
     * "Développement complet" : code + DB + UI
     * "Développement partiel" : lister ce qu'il manque
     * "En attente de liaison" : préciser avec quels composants
   - Signaler les dépendances avec d'autres fonctionnalités
   - Faire un point régulier sur l'avancement
   - Noter les tests nécessaires avant de considérer une feature comme complète


Note : Cette version du projet utilise Next.js, Prisma, et TailwindCSS. Une attention particulière est portée à la modularité pour faciliter l'ajout futur du FormBuilder.