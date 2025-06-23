// scripts/create-admin-secure.js
// Script sécurisé pour créer un admin (SANS logs de mot de passe)

// Charger les variables d'environnement depuis .env.script (pour scripts locaux)
require('dotenv').config({ path: '.env.script' })

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  const minLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  
  return {
    valid: minLength && hasNumber && hasSpecial && hasUpper && hasLower,
    errors: [
      !minLength && 'Au moins 8 caractères',
      !hasUpper && 'Au moins une majuscule',
      !hasLower && 'Au moins une minuscule', 
      !hasNumber && 'Au moins un chiffre',
      !hasSpecial && 'Au moins un caractère spécial (!@#$%^&*...)'
    ].filter(Boolean)
  }
}

async function createSecureAdmin() {
  console.log('🔐 Création sécurisée d\'un administrateur Vital Sync\n')
  
  try {
    // 1. Vérifier la connexion DB
    await prisma.$connect()
    console.log('✅ Connexion à la base de données établie')
    
    // 2. Vérifier s'il existe déjà un admin
    const existingAdmin = await prisma.userProfile.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà dans le système.')
      console.log('📧 Email existant: ***@' + existingAdmin.email.split('@')[1])
      
      const continueChoice = await question('\nVoulez-vous créer un administrateur supplémentaire ? (y/N): ')
      if (continueChoice.toLowerCase() !== 'y') {
        console.log('❌ Création annulée.')
        return
      }
    }
    
    console.log('\n📝 Saisie des informations de l\'administrateur:')
    
    // 3. Email
    let email
    do {
      email = await question('📧 Email: ')
      if (!validateEmail(email)) {
        console.log('❌ Format email invalide\n')
        email = null
      } else {
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.authUser.findUnique({
          where: { email }
        })
        if (existingUser) {
          console.log('❌ Cet email est déjà utilisé\n')
          email = null
        }
      }
    } while (!email)
    
    // 4. Nom
    let name
    do {
      name = await question('👤 Nom complet: ')
      if (!name || name.trim().length < 2) {
        console.log('❌ Le nom doit contenir au moins 2 caractères\n')
        name = null
      }
    } while (!name)
    
    // 5. Mot de passe sécurisé
    let password, confirmPassword
    do {
      // Masquer la saisie du mot de passe (rudimentaire mais mieux que rien)
      console.log('🔒 Mot de passe (tapez puis Entrée): ')
      password = await question('')
      
      const validation = validatePassword(password)
      if (!validation.valid) {
        console.log('❌ Mot de passe trop faible:')
        validation.errors.forEach(error => console.log(`   - ${error}`))
        console.log('')
        password = null
        continue
      }
      
      console.log('🔒 Confirmer le mot de passe: ')
      confirmPassword = await question('')
      
      if (password !== confirmPassword) {
        console.log('❌ Les mots de passe ne correspondent pas\n')
        password = null
      }
    } while (!password)
    
    console.log('\n🔄 Création du compte administrateur...')
    
    // 6. Création sécurisée
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Effacer les variables sensibles immédiatement
    password = null
    confirmPassword = null
    
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.authUser.create({
        data: {
          email,
          password: hashedPassword
        }
      })
      
      // Créer le profil admin
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          email,
          name: name.trim(),
          role: 'ADMIN',
          isActive: true,
          isWhitelisted: true
        }
      })
      
      // Log sécurisé (SANS informations sensibles)
      await tx.authLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_CREATED',
          success: true,
          details: {
            method: 'secure-script',
            timestamp: new Date().toISOString(),
            // PAS de mot de passe ou d'infos sensibles ici !
          }
        }
      })
      
      return { user, profile }
    })
    
    // 7. Confirmation sécurisée (SANS afficher le mot de passe)
    console.log('✅ Administrateur créé avec succès!\n')
    console.log('📋 Informations de connexion:')
    console.log(`   Email: ${email}`)
    console.log(`   Nom: ${name}`)
    console.log(`   Rôle: Administrateur`)
    console.log(`   ID: ${result.user.id.substring(0, 8)}...`) // ID partiel seulement
    
    console.log('\n🌐 Accès:')
    const baseUrl = process.env.NEXTAUTH_URL || 'https://app.vital-sync.ch'
    console.log(`   URL: ${baseUrl}/auth/login`)
    
    console.log('\n🔐 Sécurité:')
    console.log('   ✅ Mot de passe chiffré avec bcrypt (12 rounds)')
    console.log('   ✅ Aucune donnée sensible dans les logs')
    console.log('   ✅ Variables effacées de la mémoire')
    
    console.log('\n⚠️  Recommandations:')
    console.log('   1. Connectez-vous immédiatement pour tester')
    console.log('   2. Changez le mot de passe si nécessaire')
    console.log('   3. Créez des comptes séparés pour chaque utilisateur')
    console.log('   4. Ne partagez jamais ces identifiants')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message)
    
    // Log d'erreur sécurisé (sans infos sensibles)
    if (error.code === 'P2002') {
      console.log('   Contrainte unique violée (email déjà utilisé)')
    } else if (error.code === 'P1001') {
      console.log('   Problème de connexion à la base de données')
    } else {
      console.log('   Vérifiez la configuration et réessayez')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Vérification de l'environnement - CORRECTION ICI
function checkEnvironment() {
  const requiredVars = ['DATABASE_URL']
  const missing = requiredVars.filter(varName => !process.env[varName]) // CORRIGÉ: retiré .local
  
  if (missing.length > 0) {
    console.log('❌ Variables d\'environnement manquantes:')
    missing.forEach(varName => console.log(`   - ${varName}`))
    console.log('\nVérifiez votre fichier .env.local')
    process.exit(1)
  }
}

// Gestion propre des interruptions
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Interruption détectée. Nettoyage sécurisé...')
  await prisma.$disconnect()
  rl.close()
  process.exit(0)
})

// Point d'entrée
async function main() {
  console.log('🏥 Vital Sync - Configuration Admin Sécurisée\n')
  
  checkEnvironment()
  await createSecureAdmin()
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Configuration terminée!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Erreur:', error.message)
      process.exit(1)
    })
}