// prisma/seed.ts - Version corrigée
import { PrismaClient } from '@prisma/client'
import { initialLists } from './data/initial-lists'
import { initialFormConfig } from './seeds/formConfig'
import { initialRisquesProfessionnels } from './seeds/risquesProfessionnels'

const prisma = new PrismaClient()

async function seedLists() {
  console.log('🌱 Début de l\'initialisation des listes...')
  
  for (const list of initialLists) {
    console.log(`📋 Traitement de la liste: ${list.name}`)
   
    try {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await prisma.listCategory.findUnique({
        where: { listId: list.listId },
        include: { items: true }
      })

      if (existingCategory) {
        console.log(`♻️  Mise à jour de la liste existante: ${list.name}`)
        
        // Supprimer les anciens items
        await prisma.listItem.deleteMany({
          where: { categoryId: existingCategory.id },
        })
        
        // Créer les nouveaux items
        await prisma.listItem.createMany({
          data: list.items.map((value: string, index: number) => ({
            value,
            order: index,
            categoryId: existingCategory.id,
          })),
        })
      } else {
        console.log(`✨ Création d'une nouvelle liste: ${list.name}`)
        
        // Créer la catégorie avec ses items
        await prisma.listCategory.create({
          data: {
            name: list.name,
            listId: list.listId,
            items: {
              create: list.items.map((value: string, index: number) => ({
                value,
                order: index,
              })),
            },
          },
        })
      }
      console.log(`✅ Liste "${list.name}" initialisée avec ${list.items.length} éléments`)
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de la liste ${list.name}:`, error)
      throw error
    }
  }
  console.log('🎉 Initialisation des listes terminée.')
}

async function seedFormConfiguration() {
  console.log('📝 Début de l\'initialisation de la configuration du formulaire...')
  try {
    // Vérifier si la configuration existe déjà
    const existingConfig = await prisma.formConfiguration.findUnique({
      where: { pageId: initialFormConfig.pageId },
      include: { 
        sections: { 
          include: { fields: true } 
        } 
      }
    })

    if (existingConfig) {
      console.log('♻️  Mise à jour de la configuration existante...')
      // Supprimer les anciennes données dans l'ordre correct
      await prisma.formField.deleteMany({
        where: {
          section: {
            formId: existingConfig.id
          }
        }
      })
      await prisma.formSection.deleteMany({
        where: { formId: existingConfig.id }
      })
    }

    // Créer ou mettre à jour la configuration
    const form = await prisma.formConfiguration.upsert({
      where: { pageId: initialFormConfig.pageId },
      create: {
        pageId: initialFormConfig.pageId,
        name: initialFormConfig.name,
        sections: {
          create: initialFormConfig.sections.map(section => ({
            name: section.name,
            label: section.label,
            order: section.order,
            fields: {
              create: section.fields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required,
                order: field.order,
                listId: field.listId
              }))
            }
          }))
        }
      },
      update: {
        name: initialFormConfig.name,
        sections: {
          create: initialFormConfig.sections.map(section => ({
            name: section.name,
            label: section.label,
            order: section.order,
            fields: {
              create: section.fields.map(field => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required,
                order: field.order,
                listId: field.listId
              }))
            }
          }))
        }
      }
    })

    console.log('✅ Configuration du formulaire initialisée:', form.id)
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la configuration:', error)
    throw error
  }
}

async function seedRisquesProfessionnels() {
  console.log('⚠️  Début de l\'initialisation des risques professionnels...')
  
  try {
    // Vérifier les risques existants
    const existingCount = await prisma.risqueProfessionnel.count();
    
    if (existingCount > 0) {
      console.log(`♻️  ${existingCount} risques professionnels déjà présents, initialisation ignorée.`);
      return;
    }
    
    // Créer les risques initiaux
    await prisma.risqueProfessionnel.createMany({
      data: initialRisquesProfessionnels,
      skipDuplicates: true // Éviter les erreurs si certains existent déjà
    });
    
    console.log(`✅ ${initialRisquesProfessionnels.length} risques professionnels créés.`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des risques professionnels:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Démarrage du processus de seed...')
  
  try {
    // Initialiser les listes d'abord (car les autres en dépendent)
    await seedLists();
    
    // Puis initialiser la configuration du formulaire
    await seedFormConfiguration();
    
    // Initialiser les risques professionnels
    await seedRisquesProfessionnels();
    
    console.log('🎉 Initialisation complète terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Erreur fatale lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Déconnexion de la base de données.')
  })