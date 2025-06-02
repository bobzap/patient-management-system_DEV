// scripts/migrate-to-supabase.js
const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

// Configuration
const prisma = new PrismaClient()
const supabase = createClient(
  'http://127.0.0.1:54321', // URL locale
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' // Service role key
)

async function migrateData() {
  console.log('🚀 Début de la migration Prisma → Supabase')
  
  try {
    // 1. Migrer les catégories de listes
    console.log('📋 Migration des catégories de listes...')
    const categories = await prisma.listCategory.findMany({
      include: { items: true }
    })
    
    for (const category of categories) {
      const { error } = await supabase
        .from('list_categories')
        .insert({
          list_id: category.listId,
          name: category.name,
          created_at: category.createdAt,
          date_modification: category.updatedAt
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur catégorie:', error)
      }
      
      // Migrer les items de cette catégorie
      for (const item of category.items) {
        const { error: itemError } = await supabase
          .from('list_items')
          .insert({
            value: item.value,
            order: item.order,
            category_id: category.id, // Garder l'ID original
            created_at: item.createdAt,
            date_modification: item.updatedAt
          })
        
        if (itemError && !itemError.message.includes('duplicate')) {
          console.error('Erreur item:', itemError)
        }
      }
    }
    
    // 2. Migrer les patients
    console.log('👥 Migration des patients...')
    const patients = await prisma.patient.findMany()
    
    for (const patient of patients) {
      const { error } = await supabase
        .from('patients')
        .insert({
          civilites: patient.civilites,
          nom: patient.nom,
          prenom: patient.prenom,
          date_naissance: patient.dateNaissance,
          age: patient.age,
          etat_civil: patient.etatCivil,
          poste: patient.poste,
          numero_ligne: patient.numeroLigne,
          manager: patient.manager,
          zone: patient.zone,
          horaire: patient.horaire,
          contrat: patient.contrat,
          taux_activite: patient.tauxActivite,
          departement: patient.departement,
          date_entree: patient.dateEntree,
          anciennete: patient.anciennete,
          temps_trajet_aller: patient.tempsTrajetAller,
          temps_trajet_retour: patient.tempsTrajetRetour,
          type_transport: patient.typeTransport,
          numero_entretien: patient.numeroEntretien,
          nom_entretien: patient.nomEntretien,
          date_entretien: patient.dateEntretien,
          heure_debut: patient.heureDebut,
          heure_fin: patient.heureFin,
          duree: patient.duree,
          type_entretien: patient.typeEntretien,
          consentement: patient.consentement,
          date_creation: patient.dateCreation,
          created_at: patient.createdAt,
          date_modification: patient.updatedAt
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur patient:', error)
      } else {
        console.log(`✅ Patient migré: ${patient.prenom} ${patient.nom}`)
      }
    }
    
    // 3. Migrer les configurations de formulaire
    console.log('📋 Migration des configurations de formulaire...')
    const formConfigs = await prisma.formConfiguration.findMany({
      include: {
        sections: {
          include: {
            fields: true
          }
        }
      }
    })
    
    for (const config of formConfigs) {
      // Insérer la configuration
      const { error: configError } = await supabase
        .from('form_configurations')
        .insert({
          page_id: config.pageId,
          name: config.name,
          created_at: config.createdAt,
          date_modification: config.updatedAt
        })
      
      if (configError && !configError.message.includes('duplicate')) {
        console.error('Erreur config form:', configError)
        continue
      }
      
      // Insérer les sections
      for (const section of config.sections) {
        const { error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            name: section.name,
            label: section.label,
            order: section.order,
            form_id: config.id, // Garder l'ID original
            created_at: section.createdAt,
            date_modification: section.updatedAt
          })
        
        if (sectionError && !sectionError.message.includes('duplicate')) {
          console.error('Erreur section:', sectionError)
          continue
        }
        
        // Insérer les champs
        for (const field of section.fields) {
          const { error: fieldError } = await supabase
            .from('form_fields')
            .insert({
              section_id: section.id, // Garder l'ID original
              name: field.name,
              label: field.label,
              type: field.type,
              required: field.required,
              order: field.order,
              list_id: field.listId,
              default_value: field.defaultValue,
              validation: field.validation,
              position_x: field.positionX,
              position_y: field.positionY,
              created_at: field.createdAt,
              date_modification: field.updatedAt
            })
          
          if (fieldError && !fieldError.message.includes('duplicate')) {
            console.error('Erreur field:', fieldError)
          }
        }
      }
    }
    
    // 4. Migrer les entretiens
    console.log('🗣️ Migration des entretiens...')
    const entretiens = await prisma.entretien.findMany()
    
    for (const entretien of entretiens) {
      const { error } = await supabase
        .from('entretiens')
        .insert({
          patient_id: entretien.patientId,
          numero_entretien: entretien.numeroEntretien,
          date_creation: entretien.dateCreation,
          date_modification: entretien.dateModification,
          status: entretien.status,
          is_template: entretien.isTemplate,
          base_entretien_id: entretien.baseEntretienId,
          donnees_entretien: entretien.donneesEntretien,
          temps_debut: entretien.tempsDebut,
          temps_fin: entretien.tempsFin,
          temps_pause: entretien.tempsPause,
          en_pause: entretien.enPause,
          derniere_pause: entretien.dernierePause
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur entretien:', error)
      } else {
        console.log(`✅ Entretien migré: ${entretien.numeroEntretien}`)
      }
    }
    
    // 5. Migrer les événements du calendrier
    console.log('📅 Migration des événements du calendrier...')
    const events = await prisma.calendarEvent.findMany()
    
    for (const event of events) {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          description: event.description,
          start_date: event.startDate,
          end_date: event.endDate,
          all_day: event.allDay,
          event_type_string: event.eventTypeString,
          status: event.status,
          patient_id: event.patientId,
          entretien_id: event.entretienId,
          metadata: event.metadata,
          created_at: event.createdAt,
          date_modification: event.updatedAt,
          created_by: event.createdBy,
          recurrence: event.recurrence,
          parent_event_id: event.parentEventId
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur event:', error)
      } else {
        console.log(`✅ Événement migré: ${event.title}`)
      }
    }
    
    // 6. Migrer les types d'événements
    console.log('🏷️ Migration des types d\'événements...')
    const eventTypes = await prisma.eventType.findMany()
    
    for (const type of eventTypes) {
      const { error } = await supabase
        .from('event_types')
        .insert({
          name: type.name,
          color: type.color,
          icon: type.icon,
          active: type.active,
          created_at: type.createdAt,
          date_modification: type.updatedAt
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur event type:', error)
      }
    }
    
    // 7. Migrer les risques professionnels
    console.log('⚠️ Migration des risques professionnels...')
    const risques = await prisma.risqueProfessionnel.findMany()
    
    for (const risque of risques) {
      const { error } = await supabase
        .from('risques_professionnels')
        .insert({
          nom: risque.nom,
          lien: risque.lien,
          est_favori: risque.estFavori,
          created_at: risque.createdAt,
          date_modification: risque.updatedAt
        })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Erreur risque:', error)
      }
    }
    
    console.log('🎉 Migration terminée avec succès !')
    
    // Statistiques
    const stats = await getStats()
    console.log('\n📊 Statistiques de migration:')
    console.log(`Patients: ${stats.patients}`)
    console.log(`Entretiens: ${stats.entretiens}`)
    console.log(`Événements calendrier: ${stats.events}`)
    console.log(`Catégories de listes: ${stats.categories}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function getStats() {
  const [patients, entretiens, events, categories] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact' }),
    supabase.from('entretiens').select('id', { count: 'exact' }),
    supabase.from('calendar_events').select('id', { count: 'exact' }),
    supabase.from('list_categories').select('id', { count: 'exact' })
  ])
  
  return {
    patients: patients.count || 0,
    entretiens: entretiens.count || 0,
    events: events.count || 0,
    categories: categories.count || 0
  }
}

// Fonction pour vider Supabase (utile pour retester)
async function clearSupabase() {
  console.log('🧹 Nettoyage de Supabase...')
  
  const tables = [
    'calendar_events',
    'entretiens', 
    'patients',
    'form_fields',
    'form_sections',
    'form_configurations',
    'list_items',
    'list_categories',
    'event_types',
    'risques_professionnels'
  ]
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', 0)
    if (error) console.error(`Erreur nettoyage ${table}:`, error)
  }
  
  console.log('✅ Nettoyage terminé')
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--clear')) {
    await clearSupabase()
  }
  
  if (args.includes('--migrate') || args.length === 0) {
    await migrateData()
  }
}

main()