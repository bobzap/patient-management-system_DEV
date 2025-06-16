// scripts/test-supabase-login.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Lecture manuelle du fichier .env.local
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    })
    console.log('✅ Variables d\'environnement chargées depuis .env.local')
  } catch (error) {
    console.log('⚠️ Impossible de lire .env.local:', error.message)
    console.log('📝 Assurez-vous que le fichier .env.local existe avec DATABASE_URL')
  }
}

loadEnv()

const prisma = new PrismaClient()

async function testSupabaseLogin() {
  console.log('🔍 Test de connexion Supabase + Authentification...\n')
  
  try {
    // 1. Vérification de la connexion Supabase
    console.log('1️⃣ Test connexion Supabase...')
    await prisma.$connect()
    console.log('   ✅ Connexion Supabase OK\n')

    // 2. Recherche de l'admin créé
    console.log('2️⃣ Recherche de l\'admin...')
    const testEmail = 'louis.daize@gmail.com'
    const testPassword = 'Test140394.'
    
    const admin = await prisma.authUser.findUnique({
      where: { email: testEmail },
      include: { 
        profile: true 
      }
    })

    if (!admin) {
      console.log('   ❌ Admin non trouvé avec cet email')
      
      // Chercher tous les utilisateurs pour debug
      const allUsers = await prisma.authUser.findMany({
        select: { id: true, email: true, createdAt: true }
      })
      console.log(`   📊 ${allUsers.length} utilisateurs trouvés:`)
      allUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.id})`)
      })
      return
    }

    console.log('   ✅ Admin trouvé:')
    console.log(`      ID: ${admin.id}`)
    console.log(`      Email: ${admin.email}`)
    console.log(`      Créé: ${admin.createdAt}`)
    console.log(`      Hash password: ${admin.password.substring(0, 20)}...`)

    // 3. Vérification du profil
    console.log('\n3️⃣ Vérification du profil...')
    if (!admin.profile) {
      console.log('   ❌ PROBLÈME: Aucun profil associé')
      
      // Chercher les profils orphelins
      const profiles = await prisma.userProfile.findMany({
        where: { email: testEmail }
      })
      
      if (profiles.length > 0) {
        console.log('   🔧 Profil trouvé mais non lié:')
        profiles.forEach(profile => {
          console.log(`      - Profile ID: ${profile.id}, userId: ${profile.userId}`)
        })
      }
      return
    }

    console.log('   ✅ Profil trouvé:')
    console.log(`      Nom: ${admin.profile.name}`)
    console.log(`      Rôle: ${admin.profile.role}`)
    console.log(`      Actif: ${admin.profile.isActive}`)
    console.log(`      Whitelisted: ${admin.profile.isWhitelisted}`)

    // 4. Test du mot de passe
    console.log('\n4️⃣ Test du mot de passe...')
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password)
    console.log(`   ${isPasswordValid ? '✅' : '❌'} Mot de passe: ${isPasswordValid ? 'VALIDE' : 'INVALIDE'}`)
    
    if (!isPasswordValid) {
      console.log('   🔧 Tests avec variations:')
      const variations = [
        'Test140394',
        'test140394.',
        'TEST140394.'
      ]
      
      for (const variation of variations) {
        const valid = await bcrypt.compare(variation, admin.password)
        console.log(`      "${variation}": ${valid ? '✅' : '❌'}`)
      }
    }

    // 5. Simulation du processus NextAuth
    console.log('\n5️⃣ Simulation du processus NextAuth...')
    
    if (!admin.profile.isActive) {
      console.log('   ❌ PROBLÈME: Compte désactivé')
      return
    }
    
    if (!isPasswordValid) {
      console.log('   ❌ PROBLÈME: Mot de passe invalide')
      return
    }

    console.log('   ✅ Simulation NextAuth réussie')
    console.log('   📋 Objet utilisateur qui serait retourné:')
    console.log(JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.profile.name,
      role: admin.profile.role,
      isActive: admin.profile.isActive
    }, null, 2))

    // 6. Test de création d'un log d'authentification
    console.log('\n6️⃣ Test de log d\'authentification...')
    try {
      await prisma.authLog.create({
        data: {
          userId: admin.id,
          action: 'TEST_LOGIN',
          success: true,
          details: {
            test: true,
            timestamp: new Date().toISOString()
          }
        }
      })
      console.log('   ✅ Log d\'authentification créé')
    } catch (logError) {
      console.log('   ❌ Erreur lors de la création du log:', logError.message)
    }

    console.log('\n🎉 Tous les tests sont OK ! Le problème vient probablement de NextAuth.')
    console.log('\n🔧 Prochaines étapes:')
    console.log('   1. Vérifiez les logs du serveur Next.js')
    console.log('   2. Activez le debug NextAuth')
    console.log('   3. Vérifiez les variables d\'environnement')

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Problème de connexion Supabase:')
      console.log('   1. Vérifiez votre DATABASE_URL')
      console.log('   2. Vérifiez que le projet Supabase est actif')
      console.log('   3. Vérifiez les credentials de connexion')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour corriger les liaisons si nécessaire
async function fixUserProfileLinks() {
  console.log('\n🔧 Correction des liaisons utilisateur-profil...')
  
  try {
    // Trouver les profils sans utilisateur lié
    const orphanProfiles = await prisma.userProfile.findMany({
      where: {
        OR: [
          { userId: null },
          { user: null }
        ]
      }
    })

    console.log(`   📊 ${orphanProfiles.length} profils orphelins trouvés`)

    for (const profile of orphanProfiles) {
      // Chercher l'utilisateur correspondant par email
      const matchingUser = await prisma.authUser.findUnique({
        where: { email: profile.email }
      })

      if (matchingUser) {
        console.log(`   🔗 Liaison: ${profile.email} -> ${matchingUser.id}`)
        await prisma.userProfile.update({
          where: { id: profile.id },
          data: { userId: matchingUser.id }
        })
      }
    }

    console.log('   ✅ Liaisons corrigées')
    
  } catch (error) {
    console.error('   ❌ Erreur lors de la correction:', error.message)
  }
}

async function main() {
  await testSupabaseLogin()
  
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('\nVoulez-vous corriger les liaisons utilisateur-profil ? (y/N): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await fixUserProfileLinks()
    }
    rl.close()
  })
}

if (require.main === module) {
  main().catch(console.error)
}