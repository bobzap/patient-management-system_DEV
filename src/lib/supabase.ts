// src/lib/supabase.ts
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Type pour TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'ADMIN' | 'INFIRMIER' | 'INFIRMIER_CHEF' | 'MEDECIN'
          is_active: boolean
          created_at: string
          date_modification: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'ADMIN' | 'INFIRMIER' | 'INFIRMIER_CHEF' | 'MEDECIN'
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'ADMIN' | 'INFIRMIER' | 'INFIRMIER_CHEF' | 'MEDECIN'
          is_active?: boolean
        }
      }
      patients: {
        Row: {
          id: number
          civilites: string
          nom: string
          prenom: string
          date_naissance: string
          age: number
          etat_civil: string
          poste: string
          numero_ligne: string | null
          manager: string
          zone: string
          horaire: string | null
          contrat: string
          taux_activite: string
          departement: string
          date_entree: string
          anciennete: string
          temps_trajet_aller: string
          temps_trajet_retour: string
          type_transport: string
          numero_entretien: number | null
          nom_entretien: string | null
          date_entretien: string | null
          heure_debut: string | null
          heure_fin: string | null
          duree: string | null
          type_entretien: string | null
          consentement: string | null
          date_creation: string | null
          created_at: string
          date_modification: string
        }
        Insert: {
          civilites: string
          nom: string
          prenom: string
          date_naissance: string
          age: number
          etat_civil: string
          poste: string
          numero_ligne?: string | null
          manager: string
          zone: string
          horaire?: string | null
          contrat: string
          taux_activite: string
          departement: string
          date_entree: string
          anciennete: string
          temps_trajet_aller: string
          temps_trajet_retour: string
          type_transport: string
          numero_entretien?: number | null
          nom_entretien?: string | null
          date_entretien?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          duree?: string | null
          type_entretien?: string | null
          consentement?: string | null
          date_creation?: string | null
        }
        Update: {
          civilites?: string
          nom?: string
          prenom?: string
          date_naissance?: string
          age?: number
          etat_civil?: string
          poste?: string
          numero_ligne?: string | null
          manager?: string
          zone?: string
          horaire?: string | null
          contrat?: string
          taux_activite?: string
          departement?: string
          date_entree?: string
          anciennete?: string
          temps_trajet_aller?: string
          temps_trajet_retour?: string
          type_transport?: string
          numero_entretien?: number | null
          nom_entretien?: string | null
          date_entretien?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          duree?: string | null
          type_entretien?: string | null
          consentement?: string | null
          date_creation?: string | null
        }
      }
      // Ajoutez d'autres tables selon vos besoins
    }
  }
}

// Client pour les composants côté client
export const createClientSupabase = () => createClientComponentClient<Database>()

// Client pour les composants côté serveur
export const createServerSupabase = () => createServerComponentClient<Database>({ cookies })