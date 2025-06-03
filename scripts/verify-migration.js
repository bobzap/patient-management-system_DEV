// scripts/verify-migration.js
const { PrismaClient } = require('@prisma/client')
const Database = require('better-sqlite3')

async function verifyMigration() {
  console.log('🔍 Vérification de la migration SQLite → Supabase\n')
  
  // Connexion SQLite (source)
  const db = new Database('./prisma/dev.db')
  
  // Connexion Supabase (destination)
  const prisma = new PrismaClient()
  await prisma.$connect()
  
  try {
    // Comparaison des counts
    console.log('📊 Comparaison des données:\n')
    
    // 1. ListCategory
    const sqliteCategories = db.prepare('SELECT COUNT(*) as count FROM ListCategory').get().count
    const supabaseCategories = await prisma.listCategory.count()
    console.log(`📋 Catégories: SQLite(${sqliteCategories}) → Supabase(${supabaseCategories}) ${sqliteCategories === supabaseCategories ? '✅' : '❌'}`)
    
    // 2. ListItem
    const sqliteItems = db.prepare('SELECT COUNT(*) as count FROM ListItem').get().count
    const supabaseItems = await prisma.listItem.count()
    console.log(`📝 Items: SQLite(${sqliteItems}) → Supabase(${supabaseItems}) ${sqliteItems === supabaseItems ? '✅' : '❌'}`)
    
    // 3. Patient
    const sqlitePatients = db.prepare('SELECT COUNT(*) as count FROM Patient').get().count
    const supabasePatients = await prisma.patient.count()
    console.log(`👥 Patients: SQLite(${sqlitePatients}) → Supabase(${supabasePatients}) ${sqlitePatients === supabasePatients ? '✅' : '❌'}`)
    
    // 4. EventType
    const sqliteEventTypes = db.prepare('SELECT COUNT(*) as count FROM EventType').get().count
    const supabaseEventTypes = await prisma.eventType.count()
    console.log(`🏷️ Types d'événements: SQLite(${sqliteEventTypes}) → Supabase(${supabaseEventTypes}) ${sqliteEventTypes === supabaseEventTypes ? '✅' : '❌'}`)
    
    // 5. FormConfiguration
    const sqliteFormConfigs = db.prepare('SELECT COUNT(*) as count FROM FormConfiguration').get().count
    const supabaseFormConfigs = await prisma.formConfiguration.count()
    console.log(`📋 Configurations: SQLite(${sqliteFormConfigs}) → Supabase(${supabaseFormConfigs}) ${sqliteFormConfigs === supabaseFormConfigs ? '✅' : '❌'}`)
    
    // 6. FormSection
    const sqliteSections = db.prepare('SELECT COUNT(*) as count FROM FormSection').get().count
    const supabaseSections = await prisma.formSection.count()
    console.log(`📄 Sections: SQLite(${sqliteSections}) → Supabase(${supabaseSections}) ${sqliteSections === supabaseSections ? '✅' : '❌'}`)
    
    // 7. FormField
    const sqliteFields = db.prepare('SELECT COUNT(*) as count FROM FormField').get().count
    const supabaseFields = await prisma.formField.count()
    console.log(`🔤 Champs: SQLite(${sqliteFields}) → Supabase(${supabaseFields}) ${sqliteFields === supabaseFields ? '✅' : '❌'}`)
    
    // 8. Entretien
    const sqliteEntretiens = db.prepare('SELECT COUNT(*) as count FROM Entretien').get().count
    const supabaseEntretiens = await prisma.entretien.count()
    console.log(`🗣️ Entretiens: SQLite(${sqliteEntretiens}) → Supabase(${supabaseEntretiens}) ${sqliteEntretiens === supabaseEntretiens ? '✅' : '❌'}`)
    
    // 9. CalendarEvent
    const sqliteEvents = db.prepare('SELECT COUNT(*) as count FROM CalendarEvent').get().count
    const supabaseEvents = await prisma.calendarEvent.count()
    console.log(`📅 Événements: SQLite(${sqliteEvents}) → Supabase(${supabaseEvents}) ${sqliteEvents === supabaseEvents ? '✅' : '❌'}`)
    
    // 10. RisqueProfessionnel
    const sqliteRisques = db.prepare('SELECT COUNT(*) as count FROM RisqueProfessionnel').get().count
    const supabaseRisques = await prisma.risqueProfessionnel.count()
    console.log(`⚠️ Risques: SQLite(${sqliteRisques}) → Supabase(${supabaseRisques}) ${sqliteRisques === supabaseRisques ? '✅' : '❌'}`)
    
    console.log('\n🔗 Vérification des relations:\n')
    
    // Vérification des relations
    // 1. Patients → Entretiens
    const patientsWithEntretiens = await prisma.patient.findMany({
      include: { entretiens: true }
    })
    const totalEntretiensViaPatients = patientsWithEntretiens.reduce((sum, p) => sum + p.entretiens.length, 0)
    console.log(`👥→🗣️ Entretiens via patients: ${totalEntretiensViaPatients} ${totalEntretiensViaPatients === supabaseEntretiens ? '✅' : '❌'}`)
    
    // 2. Catégories → Items
    const categoriesWithItems = await prisma.listCategory.findMany({
      include: { items: true }
    })
    const totalItemsViaCategories = categoriesWithItems.reduce((sum, c) => sum + c.items.length, 0)
    console.log(`📋→📝 Items via catégories: ${totalItemsViaCategories} ${totalItemsViaCategories === supabaseItems ? '✅' : '❌'}`)
    
    // 3. Configurations → Sections → Fields
    const configsWithSections = await prisma.formConfiguration.findMany({
      include: {
        sections: {
          include: { fields: true }
        }
      }
    })
    const totalSectionsViaConfigs = configsWithSections.reduce((sum, c) => sum + c.sections.length, 0)
    const totalFieldsViaSections = configsWithSections.reduce((sum, c) => 
      sum + c.sections.reduce((sSum, s) => sSum + s.fields.length, 0), 0)
    
    console.log(`📋→📄 Sections via configs: ${totalSectionsViaConfigs} ${totalSectionsViaConfigs === supabaseSections ? '✅' : '❌'}`)
    console.log(`📄→🔤 Champs via sections: ${totalFieldsViaSections} ${totalFieldsViaSections === supabaseFields ? '✅' : '❌'}`)
    
    console.log('\n📋 Échantillons de données:\n')
    
    // Échantillons
    const samplePatient = await prisma.patient.findFirst()
    if (samplePatient) {
      console.log(`👤 Premier patient: ${samplePatient.prenom} ${samplePatient.nom} (ID: ${samplePatient.id})`)
    }
    
    const sampleCategory = await prisma.listCategory.findFirst({ include: { items: true } })
    if (sampleCategory) {
      console.log(`📋 Première catégorie: ${sampleCategory.name} (${sampleCategory.items.length} items)`)
    }
    
    const sampleEntretien = await prisma.entretien.findFirst({ include: { patient: true } })
    if (sampleEntretien) {
      console.log(`🗣️ Premier entretien: N°${sampleEntretien.numeroEntretien} pour ${sampleEntretien.patient.prenom} ${sampleEntretien.patient.nom}`)
    }
    
    // Résumé global
    const totalExpected = sqliteCategories + sqliteItems + sqlitePatients + sqliteEventTypes + 
                         sqliteFormConfigs + sqliteSections + sqliteFields + sqliteEntretiens + 
                         sqliteEvents + sqliteRisques
    
    const totalMigrated = supabaseCategories + supabaseItems + supabasePatients + supabaseEventTypes + 
                         supabaseFormConfigs + supabaseSections + supabaseFields + supabaseEntretiens + 
                         supabaseEvents + supabaseRisques
    
    console.log(`\n🎯 RÉSUMÉ GLOBAL:`)
    console.log(`Total attendu: ${totalExpected}`)
    console.log(`Total migré: ${totalMigrated}`)
    console.log(`Migration: ${totalExpected === totalMigrated ? '✅ COMPLÈTE' : '❌ INCOMPLÈTE'}`)
    
    if (totalExpected === totalMigrated) {
      console.log('\n🎉 MIGRATION RÉUSSIE ! Toutes vos données ont été transférées.')
      console.log('Vous pouvez maintenant tester votre application Next.js !')
    } else {
      console.log('\n⚠️ Des données semblent manquer. Vérifiez les logs de migration.')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    db.close()
    await prisma.$disconnect()
  }
}

verifyMigration().catch(console.error)