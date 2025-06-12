// scripts/create-admin.js
// Script pour créer le premier compte administrateur

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
  // Au moins 8 caractères, 1 chiffre, 1 caractère spécial
  const minLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    valid: minLength && hasNumber && hasSpecial,
    errors: [
      !minLength && 'Le mot de passe doit contenir au moins 8 caractères',
      !hasNumber && 'Le mot de passe doit contenir au moins un chiffre',
      !hasSpecial && 'Le mot de passe doit contenir au moins un caractère spécial'
    ].filter(Boolean)
  }
}

async function createFirstAdmin() {
  console.log('🚀 Configuration du premier administrateur Vital Sync\n')
  
  try {
    // Vérifier s'il existe déjà un admin
    const existingAdmin = await prisma.userProfile.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      console.log('❌ Un administrateur existe déjà dans le système.')
      console.log('   Si vous avez perdu l\'accès, contactez le support technique.')
      process.exit(1)
    }
    
    console.log('📝 Veuillez fournir les informations du premier administrateur:\n')
    
    // Demander les informations
    let email, name, password
    
    // Email
    do {
      email = await question('📧 Email administrateur: ')
      if (!validateEmail(email)) {
        console.log('❌ Format d\'email invalide. Veuillez réessayer.\n')
        email = null
      }
    } while (!email)
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.authUser.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà.')
      process.exit(1)
    }
    
    // Nom
    do {
      name = await question('👤 Nom complet: ')
      if (!name || name.trim().length < 2) {
        console.log('❌ Le nom doit contenir au moins 2 caractères. Veuillez réessayer.\n')
        name = null
      }
    } while (!name)
    
    // Mot de passe
    do {
      password = await question('🔒 Mot de passe: ')
      const validation = validatePassword(password)
      
      if (!validation.valid) {
        console.log('❌ Mot de passe invalide:')
        validation.errors.forEach(error => console.log(`   - ${error}`))
        console.log('')
        password = null
      }
    } while (!password)
    
    const confirmPassword = await question('🔒 Confirmer le mot de passe: ')
    
    if (password !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas.')
      process.exit(1)
    }
    
    console.log('\n🔄 Création du compte administrateur...')
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Créer l'utilisateur et le profil
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
      
      // Logger la création
      await tx.authLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_CREATED',
          success: true,
          details: {
            method: 'script',
            initialSetup: true
          }
        }
      })
      
      return { user, profile }
    })
    
    console.log('✅ Compte administrateur créé avec succès!')
    console.log('\n📋 Résumé:')
    console.log(`   Email: ${email}`)
    console.log(`   Nom: ${name}`)
    console.log(`   Rôle: Administrateur`)
    console.log(`   ID: ${result.user.id}`)
    
    console.log('\n🔐 Informations de sécurité:')
    console.log('   - Mot de passe hashé avec bcrypt (12 rounds)')
    console.log('   - Compte privilégié (whitelist activée)')
    console.log('   - Session automatique après 4h d\'inactivité')
    
    console.log('\n🌐 Accès:')
    console.log(`   URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login`)
    
    console.log('\n⚠️  Recommandations de sécurité:')
    console.log('   1. Changez le mot de passe après la première connexion')
    console.log('   2. Activez la 2FA dès que possible (future fonctionnalité)')
    console.log('   3. Ne partagez jamais ces identifiants')
    console.log('   4. Créez des comptes séparés pour chaque utilisateur')
    console.log('\n🔧 Pour la production:')
    console.log('   - Changez NEXTAUTH_URL vers https://vital-sync.ch')
    console.log('   - Régénérez NEXTAUTH_SECRET')
    console.log('   - Configurez les certificats SSL')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error)
    
    if (error.code === 'P2002') {
      console.log('   Un utilisateur avec cet email existe déjà.')
    } else {
      console.log('   Vérifiez la connexion à la base de données.')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Vérifier les variables d'environnement
function checkEnvironment() {
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.log('❌ Variables d\'environnement manquantes:')
    missing.forEach(varName => console.log(`   - ${varName}`))
    console.log('\nVeuillez configurer votre fichier .env.local')
    process.exit(1)
  }
}

// Point d'entrée principal
async function main() {
  console.log('🏥 Vital Sync - Configuration Initiale\n')
  
  // Vérifier l'environnement
  checkEnvironment()
  
  // Tester la connexion à la base
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la base de données établie\n')
  } catch (error) {
    console.log('❌ Impossible de se connecter à la base de données')
    console.error('   Erreur:', error.message)
    process.exit(1)
  }
  
  // Créer le premier admin
  await createFirstAdmin()
}

// Gestion des signaux
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Interruption détectée. Nettoyage...')
  await prisma.$disconnect()
  rl.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Arrêt demandé. Nettoyage...')
  await prisma.$disconnect()
  rl.close()
  process.exit(0)
})

// Exécution du script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Configuration terminée avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error)
      process.exit(1)
    })
}