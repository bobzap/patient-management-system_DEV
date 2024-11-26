// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { initialLists } from './data/initial-lists'

const prisma = new PrismaClient()

async function main() {
  console.log('Début de l\'initialisation des listes...')

  for (const list of initialLists) {
    console.log(`Traitement de la liste: ${list.name}`)
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.listCategory.findUnique({
      where: { listId: list.listId },
    })

    if (existingCategory) {
      console.log(`Mise à jour de la liste existante: ${list.name}`)
      
      // Supprimer les anciens items
      await prisma.listItem.deleteMany({
        where: { categoryId: existingCategory.id },
      })

      // Créer les nouveaux items
      await prisma.listItem.createMany({
        data: list.items.map((value, index) => ({
          value,
          order: index,
          categoryId: existingCategory.id,
        })),
      })
    } else {
      console.log(`Création d'une nouvelle liste: ${list.name}`)
      
      // Créer la nouvelle catégorie avec ses items
      await prisma.listCategory.create({
        data: {
          name: list.name,
          listId: list.listId,
          items: {
            create: list.items.map((value, index) => ({
              value,
              order: index,
            })),
          },
        },
      })
    }
  }

  console.log('Initialisation terminée.')
}

main()
  .catch((e) => {
    console.error('Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })