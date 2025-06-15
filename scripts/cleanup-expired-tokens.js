// scripts/cleanup-expired-tokens.js
// Script pour nettoyer les tokens d'invitation expirés

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupExpiredTokens() {
  console.log('🧹 Nettoyage des tokens d\'invitation expirés...')
  
  try {
    // Compter les tokens expirés avant suppression
    const expiredCount = await prisma.invitationToken.count({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isUsed: false
      }
    })
    
    console.log(`📊 ${expiredCount} tokens expirés trouvés`)
    
    if (expiredCount === 0) {
      console.log('📝 Action loggée pour audit')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    
    // Logger l'erreur pour audit
    try {
      const adminUsers = await prisma.userProfile.findMany({
        where: { role: 'ADMIN' },
        select: { userId: true }
      })
      
      if (adminUsers.length > 0) {
        await prisma.authLog.create({
          data: {
            userId: adminUsers[0].userId,
            action: 'CLEANUP_EXPIRED_TOKENS',
            success: false,
            details: {
              error: error.message,
              cleanupDate: new Date().toISOString(),
              automated: true
            }
          }
        })
      }
    } catch (logError) {
      console.error('❌ Erreur lors du logging:', logError)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour afficher les statistiques des tokens
async function showTokenStats() {
  console.log('📊 Statistiques des tokens d\'invitation:')
  
  try {
    const stats = await prisma.invitationToken.groupBy({
      by: ['isUsed'],
      where: {
        expiresAt: {
          gt: new Date() // Seulement les tokens non expirés
        }
      },
      _count: {
        id: true
      }
    })
    
    const activeTokens = stats.find(s => !s.isUsed)?._count.id || 0
    const usedTokens = stats.find(s => s.isUsed)?._count.id || 0
    
    console.log(`   🟢 Tokens actifs: ${activeTokens}`)
    console.log(`   ✅ Tokens utilisés: ${usedTokens}`)
    
    // Compter les tokens expirés
    const expiredTokens = await prisma.invitationToken.count({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isUsed: false
      }
    })
    
    console.log(`   🔴 Tokens expirés: ${expiredTokens}`)
    
    // Tokens expirant bientôt (dans les 24h)
    const expiringSoon = await prisma.invitationToken.count({
      where: {
        expiresAt: {
          lt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          gt: new Date()
        },
        isUsed: false
      }
    })
    
    console.log(`   ⚠️  Tokens expirant dans 24h: ${expiringSoon}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error)
  }
}

// Fonction pour lister les utilisateurs en attente d'activation
async function showPendingUsers() {
  console.log('\n👥 Utilisateurs en attente d\'activation:')
  
  try {
    const pendingUsers = await prisma.userProfile.findMany({
      where: {
        isActive: false
      },
      include: {
        user: {
          include: {
            receivedInvitation: {
              where: {
                isUsed: false,
                expiresAt: {
                  gt: new Date()
                }
              }
            }
          }
        }
      }
    })
    
    if (pendingUsers.length === 0) {
      console.log('   ✅ Aucun utilisateur en attente')
      return
    }
    
    pendingUsers.forEach(user => {
      const hasActiveInvitation = user.user.receivedInvitation.length > 0
      const invitationExpiry = hasActiveInvitation ? 
        user.user.receivedInvitation[0].expiresAt.toLocaleDateString('fr-FR') : 
        'N/A'
      
      console.log(`   📧 ${user.email} (${user.name})`)
      console.log(`      Rôle: ${user.role}`)
      console.log(`      Invitation active: ${hasActiveInvitation ? '✅' : '❌'}`)
      if (hasActiveInvitation) {
        console.log(`      Expire le: ${invitationExpiry}`)
      }
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
  }
}

// Point d'entrée principal
async function main() {
  console.log('🏥 Vital Sync - Maintenance des tokens d\'invitation\n')
  
  const args = process.argv.slice(2)
  const command = args[0] || 'cleanup'
  
  switch (command) {
    case 'cleanup':
      await cleanupExpiredTokens()
      break
      
    case 'stats':
      await showTokenStats()
      break
      
    case 'pending':
      await showPendingUsers()
      break
      
    case 'all':
      await showTokenStats()
      await showPendingUsers()
      await cleanupExpiredTokens()
      break
      
    default:
      console.log('Usage: node scripts/cleanup-expired-tokens.js [command]')
      console.log('')
      console.log('Commandes disponibles:')
      console.log('  cleanup  - Nettoyer les tokens expirés (défaut)')
      console.log('  stats    - Afficher les statistiques des tokens')
      console.log('  pending  - Lister les utilisateurs en attente')
      console.log('  all      - Exécuter toutes les commandes')
      break
  }
}

// Protection contre les erreurs non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error)
  process.exit(1)
})

// Exécution du script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Maintenance terminée avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error)
      process.exit(1)
    })
}✅ Aucun token expiré à nettoyer')
      return
    }
    
    // Supprimer les tokens expirés
    const result = await prisma.invitationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isUsed: false
      }
    })
    
    console.log(`✅ ${result.count} tokens expirés supprimés`)
    
    // Optionnel : Logger cette action pour audit
    const adminUsers = await prisma.userProfile.findMany({
      where: { role: 'ADMIN' },
      select: { userId: true }
    })
    
    if (adminUsers.length > 0) {
      await prisma.authLog.create({
        data: {
          userId: adminUsers[0].userId, // Premier admin trouvé
          action: 'CLEANUP_EXPIRED_TOKENS',
          success: true,
          details: {
            tokensDeleted: result.count,
            cleanupDate: new Date().toISOString(),
            automated: true
          }
        }
      })
    }
    
    console.log('