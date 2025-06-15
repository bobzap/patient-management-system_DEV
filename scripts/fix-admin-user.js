// scripts/fix-admin-user.js
// Script pour corriger les problèmes avec l'utilisateur admin

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function findCurrentAdminSessions() {
  console.log('🔍 Recherche des sessions admin existantes...')
  
  try {
    // Chercher les sessions actives
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
    
    console.log(`📊 ${sessions.length} sessions trouvées:`)
    
    sessions.forEach(session => {
      console.log(`   🔐 Session ${session.id}`)
      console.log(`      - User ID: ${session.userId}`)
      console.log(`      - Utilisateur: ${session.user?.email || '❌ INEXISTANT'}`)
      console.log(`      - Rôle: ${session.user?.profile?.role || 'AUCUN'}`)
      console.log(`      - Expire: ${session.expires.toLocaleString('fr-FR')}`)
      console.log('')
    })
    
    return sessions
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return []
  }
}

async function findOrphanSessions() {
  console.log('🔍 Recherche des sessions orphelines...')
  
  try {
    const orphanSessions = await prisma.$queryRaw`
      SELECT s.id, s.user_id, s.expires 
      FROM sessions s 
      WHERE s.user_id NOT IN (SELECT id FROM auth_users)
    `
    
    console.log(`⚠️ ${orphanSessions.length} sessions orphelines trouvées:`)
    orphanSessions.forEach(session => {
      console.log(`   🔐 Session ${session.id}: user_id=${session.user_id}`)
    })
    
    return orphanSessions
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return []
  }
}

async function recreateAdminUser() {
  console.log('🔧 Recréation de l\'utilisateur admin...')
  
  try {
    const adminEmail = 'louis.daize@gmail.com'
    const adminName = 'Louis DAIZE'
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.authUser.findUnique({
      where: { email: adminEmail },
      include: { profile: true }
    })
    
    if (existingAdmin) {
      console.log(`✅ Utilisateur admin existe déjà: ${existingAdmin.id}`)
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Rôle: ${existingAdmin.profile?.role || 'AUCUN'}`)
      return existingAdmin
    }
    
    // Demander le mot de passe
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const password = await new Promise(resolve => {
      rl.question('🔒 Mot de passe pour le compte admin: ', resolve)
    })
    rl.close()
    
    if (!password || password.length < 8) {
      console.log('❌ Mot de passe trop court (minimum 8 caractères)')
      return null
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Créer l'utilisateur et le profil
    const newAdmin = await prisma.$transaction(async (tx) => {
      const user = await tx.authUser.create({
        data: {
          email: adminEmail,
          password: hashedPassword
        }
      })
      
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          email: adminEmail,
          name: adminName,
          role: 'ADMIN',
          isActive: true,
          isWhitelisted: true
        }
      })
      
      return { user, profile }
    })
    
    console.log('✅ Nouvel utilisateur admin créé:')
    console.log(`   ID: ${newAdmin.user.id}`)
    console.log(`   Email: ${newAdmin.user.email}`)
    console.log(`   Rôle: ${newAdmin.profile.role}`)
    
    return newAdmin.user
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
    return null
  }
}

async function cleanupOrphanSessions() {
  console.log('🧹 Nettoyage des sessions orphelines...')
  
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM sessions 
      WHERE user_id NOT IN (SELECT id FROM auth_users)
    `
    
    console.log(`🗑️ ${result} sessions orphelines supprimées`)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

async function main() {
  console.log('🏥 Vital Sync - Correction de l\'utilisateur admin\n')
  
  const action = process.argv[2] || 'diagnose'
  
  try {
    switch (action) {
      case 'diagnose':
        await findCurrentAdminSessions()
        await findOrphanSessions()
        break
        
      case 'recreate':
        await recreateAdminUser()
        break
        
      case 'cleanup':
        await cleanupOrphanSessions()
        break
        
      case 'full-fix':
        console.log('🔧 Correction complète...\n')
        await findCurrentAdminSessions()
        await findOrphanSessions()
        await cleanupOrphanSessions()
        await recreateAdminUser()
        console.log('\n✅ Correction terminée!')
        console.log('\n📋 Prochaines étapes:')
        console.log('   1. Redémarrez l\'application')
        console.log('   2. Videz le cache du navigateur')
        console.log('   3. Reconnectez-vous avec le nouveau compte')
        break
        
      default:
        console.log('Usage: node scripts/fix-admin-user.js [action]')
        console.log('Actions disponibles:')
        console.log('  diagnose   - Analyser les sessions (défaut)')
        console.log('  recreate   - Recréer l\'utilisateur admin')
        console.log('  cleanup    - Nettoyer les sessions orphelines')
        console.log('  full-fix   - Correction complète')
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}