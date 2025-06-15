// scripts/diagnose-users.js
// Script pour diagnostiquer les problèmes de données utilisateurs

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function diagnoseUsers() {
  console.log('🔍 Diagnostic des données utilisateurs...\n')
  
  try {
    // 1. Vérifier les utilisateurs et leurs profils
    console.log('1️⃣ Vérification des utilisateurs...')
    const users = await prisma.authUser.findMany({
      include: {
        profile: true,
        receivedInvitations: true,
        createdInvitations: true
      }
    })
    
    console.log(`   📊 Total utilisateurs: ${users.length}`)
    
    users.forEach(user => {
      console.log(`   👤 ${user.email} (ID: ${user.id})`)
      console.log(`      - Profil: ${user.profile ? '✅' : '❌'}`)
      console.log(`      - Rôle: ${user.profile?.role || 'AUCUN'}`)
      console.log(`      - Actif: ${user.profile?.isActive ? '✅' : '❌'}`)
      console.log(`      - Invitations reçues: ${user.receivedInvitations.length}`)
      console.log(`      - Invitations créées: ${user.createdInvitations.length}`)
      console.log('')
    })
    
    // 2. Vérifier les tokens d'invitation
    console.log('2️⃣ Vérification des tokens d\'invitation...')
    const tokens = await prisma.invitationToken.findMany({
      include: {
        user: { select: { email: true } },
        creator: { select: { email: true } }
      }
    })
    
    console.log(`   📊 Total tokens: ${tokens.length}`)
    
    tokens.forEach(token => {
      const status = token.isUsed ? '✅ Utilisé' : 
                    token.expiresAt < new Date() ? '⏰ Expiré' : '🟢 Actif'
      
      console.log(`   🎫 Token ${token.token.substring(0, 8)}...`)
      console.log(`      - Email: ${token.email}`)
      console.log(`      - Utilisateur: ${token.user?.email || '❌ INEXISTANT'}`)
      console.log(`      - Créé par: ${token.creator?.email || '❌ INEXISTANT'}`)
      console.log(`      - Statut: ${status}`)
      console.log(`      - Expire: ${token.expiresAt.toLocaleDateString('fr-FR')}`)
      console.log('')
    })
    
    // 3. Vérifier les contraintes FK
    console.log('3️⃣ Vérification des contraintes de clés étrangères...')
    
    // Tokens orphelins (user_id inexistant)
    const orphanTokensUser = await prisma.invitationToken.findMany({
      where: {
        user: null
      }
    })
    
    // Tokens orphelins (created_by inexistant)
    const orphanTokensCreator = await prisma.invitationToken.findMany({
      where: {
        creator: null
      }
    })
    
    console.log(`   🔗 Tokens avec user_id orphelin: ${orphanTokensUser.length}`)
    console.log(`   🔗 Tokens avec created_by orphelin: ${orphanTokensCreator.length}`)
    
    if (orphanTokensUser.length > 0) {
      console.log('   ❌ PROBLÈME: Tokens avec user_id invalide détectés')
      orphanTokensUser.forEach(token => {
        console.log(`      - Token ${token.id}: userId=${token.userId}`)
      })
    }
    
    if (orphanTokensCreator.length > 0) {
      console.log('   ❌ PROBLÈME: Tokens avec created_by invalide détectés')
      orphanTokensCreator.forEach(token => {
        console.log(`      - Token ${token.id}: createdBy=${token.createdBy}`)
      })
    }
    
    // 4. Profils orphelins - requête SQL directe
    console.log('4️⃣ Vérification des profils...')
    const profilesWithoutUserRaw = await prisma.$queryRaw`
      SELECT id, user_id, email FROM user_profiles 
      WHERE user_id NOT IN (SELECT id FROM auth_users)
    `
    
    console.log(`   👤 Profils orphelins: ${profilesWithoutUserRaw.length}`)
    
    if (profilesWithoutUserRaw.length > 0) {
      console.log('   ❌ PROBLÈME: Profils sans utilisateur détectés')
      profilesWithoutUserRaw.forEach(profile => {
        console.log(`      - Profil ${profile.id}: userId=${profile.user_id} (email: ${profile.email})`)
      })
    }
    
    // 5. Recommandations
    console.log('\n📋 RECOMMANDATIONS:')
    
    if (orphanTokensUserRaw.length > 0 || orphanTokensCreatorRaw.length > 0) {
      console.log('   🧹 Nettoyer les tokens orphelins avec:')
      console.log('      npm run cleanup:users')
    }
    
    if (profilesWithoutUserRaw.length > 0) {
      console.log('   🔧 Supprimer les profils orphelins avec:')
      console.log('      npm run cleanup:users')
    }
    
    const inactiveUsers = users.filter(u => u.profile && !u.profile.isActive)
    if (inactiveUsers.length > 0) {
      console.log(`   👥 ${inactiveUsers.length} utilisateurs inactifs en attente d'activation`)
    }
    
    console.log('\n✅ Diagnostic terminé')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour nettoyer les données orphelines
async function cleanupOrphanData() {
  console.log('🧹 Nettoyage des données orphelines...\n')
  
  try {
    // Supprimer les tokens avec des FK invalides
    const deletedTokens = await prisma.$executeRaw`
      DELETE FROM invitation_tokens 
      WHERE user_id NOT IN (SELECT id FROM auth_users)
         OR created_by NOT IN (SELECT id FROM auth_users)
    `
    
    console.log(`🗑️ ${deletedTokens} tokens orphelins supprimés`)
    
    // Supprimer les profils orphelins
    const deletedProfiles = await prisma.$executeRaw`
      DELETE FROM user_profiles 
      WHERE user_id NOT IN (SELECT id FROM auth_users)
    `
    
    console.log(`🗑️ ${deletedProfiles} profils orphelins supprimés`)
    
    console.log('✅ Nettoyage terminé')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Point d'entrée
async function main() {
  const action = process.argv[2] || 'diagnose'
  
  switch (action) {
    case 'diagnose':
      await diagnoseUsers()
      break
    case 'cleanup':
      await cleanupOrphanData()
      break
    default:
      console.log('Usage: node scripts/diagnose-users.js [diagnose|cleanup]')
      console.log('  diagnose - Analyser les données (défaut)')
      console.log('  cleanup  - Nettoyer les données orphelines')
  }
}

if (require.main === module) {
  main()
}