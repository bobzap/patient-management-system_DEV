// scripts/fix-database-url.js
const fs = require('fs')
const path = require('path')

function fixDatabaseUrl() {
  console.log('🔧 Correction de la DATABASE_URL...\n')
  
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local introuvable')
    return
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  
  // Extraire les variables existantes
  let supabaseUrl = null
  let currentDatabaseUrl = null
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').replace(/^["']|["']$/g, '')
      
      if (key?.trim() === 'SUPABASE_URL') {
        supabaseUrl = value
      } else if (key?.trim() === 'DATABASE_URL') {
        currentDatabaseUrl = value
      }
    }
  })
  
  console.log('📋 Variables trouvées:')
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ ' + supabaseUrl : '❌ Non trouvée'}`)
  console.log(`   DATABASE_URL actuelle: ${currentDatabaseUrl}\n`)
  
  if (!supabaseUrl) {
    console.log('❌ SUPABASE_URL non trouvée dans .env.local')
    console.log('📝 Vous devez d\'abord configurer SUPABASE_URL')
    return
  }
  
  // Construire la DATABASE_URL à partir de SUPABASE_URL
  try {
    const url = new URL(supabaseUrl)
    const host = url.hostname
    
    // Extraire l'identifiant du projet (partie avant .supabase.co)
    const projectId = host.split('.')[0]
    
    console.log('🔍 Détection du projet Supabase:')
    console.log(`   Host: ${host}`)
    console.log(`   Project ID: ${projectId}`)
    
    // Demander le mot de passe de la base de données
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    console.log('\n🔐 Configuration de la DATABASE_URL Supabase...')
    console.log('📍 Pour trouver votre mot de passe de base de données:')
    console.log('   1. Allez sur https://supabase.com/dashboard')
    console.log('   2. Sélectionnez votre projet')
    console.log('   3. Allez dans Settings > Database')
    console.log('   4. Dans "Connection string", cliquez sur "URI"')
    console.log('   5. Copiez le mot de passe (après postgres:)')
    
    rl.question('\n🔒 Entrez le mot de passe de votre base de données Supabase: ', (password) => {
      if (!password) {
        console.log('❌ Mot de passe requis')
        rl.close()
        return
      }
      
      // Construire la nouvelle DATABASE_URL
      let newDatabaseUrl
      
      if (host.includes('pooler.supabase.com')) {
        // Format pooler (recommandé)
        newDatabaseUrl = `postgresql://postgres.${projectId}:${password}@${host}:5432/postgres`
      } else {
        // Format direct
        newDatabaseUrl = `postgresql://postgres:${password}@${host}:5432/postgres`
      }
      
      console.log(`\n✅ Nouvelle DATABASE_URL générée:`)
      console.log(`   ${newDatabaseUrl.replace(password, '***')}\n`)
      
      // Remplacer dans le fichier
      const updatedContent = envContent.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL="${newDatabaseUrl}"`
      )
      
      // Backup de l'ancien fichier
      fs.writeFileSync(envPath + '.backup', envContent)
      console.log('💾 Backup créé: .env.local.backup')
      
      // Écrire le nouveau fichier
      fs.writeFileSync(envPath, updatedContent)
      console.log('✅ .env.local mis à jour')
      
      console.log('\n🧪 Test de la nouvelle configuration...')
      testConnection(newDatabaseUrl)
      
      rl.close()
    })
    
  } catch (error) {
    console.error('❌ Erreur lors du parsing de SUPABASE_URL:', error.message)
  }
}

async function testConnection(databaseUrl) {
  try {
    process.env.DATABASE_URL = databaseUrl
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('   🔗 Connexion en cours...')
    await prisma.$connect()
    console.log('   ✅ Connexion réussie!')
    
    const userCount = await prisma.authUser.count()
    console.log(`   📊 Nombre d'utilisateurs: ${userCount}`)
    
    if (userCount > 0) {
      const admin = await prisma.authUser.findFirst({
        where: { email: 'louis.daize@gmail.com' },
        include: { profile: true }
      })
      
      if (admin) {
        console.log('   👤 Admin trouvé:')
        console.log(`      Email: ${admin.email}`)
        console.log(`      Profil: ${admin.profile ? '✅' : '❌'}`)
      }
    }
    
    await prisma.$disconnect()
    
    console.log('\n🎉 Configuration terminée avec succès!')
    console.log('🔗 Vous pouvez maintenant tester la connexion:')
    console.log('   npm run dev -- -p 3002')
    console.log('   http://localhost:3002/auth/login')
    
  } catch (error) {
    console.error('   ❌ Erreur de connexion:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('   🔧 Le mot de passe est incorrect')
      console.log('   📝 Vérifiez le mot de passe dans Supabase Dashboard > Settings > Database')
    } else if (error.message.includes('could not connect')) {
      console.log('   🔧 Impossible de se connecter au serveur')
      console.log('   📝 Vérifiez que votre projet Supabase est actif')
    }
  }
}

// Alternative: Utiliser la connection string directement depuis Supabase
function useDirectConnectionString() {
  console.log('\n📋 Alternative: Utiliser la connection string directement')
  console.log('1. Allez sur https://supabase.com/dashboard')
  console.log('2. Sélectionnez votre projet')
  console.log('3. Settings > Database')
  console.log('4. Copiez la "Connection string" complète en mode "URI"')
  console.log('5. Remplacez [YOUR-PASSWORD] par votre mot de passe')
  console.log('6. Collez-la directement dans DATABASE_URL')
  
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('\nCollez votre connection string complète ici: ', (connectionString) => {
    if (!connectionString || !connectionString.startsWith('postgresql://')) {
      console.log('❌ Connection string invalide')
      rl.close()
      return
    }
    
    // Mettre à jour le fichier
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const updatedContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL="${connectionString}"`
    )
    
    fs.writeFileSync(envPath + '.backup', envContent)
    fs.writeFileSync(envPath, updatedContent)
    
    console.log('✅ .env.local mis à jour')
    console.log('🧪 Test de la connexion...')
    
    testConnection(connectionString)
    rl.close()
  })
}

function main() {
  console.log('🔧 Correction de la DATABASE_URL pour Supabase\n')
  console.log('Choisissez une méthode:')
  console.log('1. Génération automatique (recommandé)')
  console.log('2. Saisie manuelle de la connection string')
  
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('\nVotre choix (1 ou 2): ', (choice) => {
    rl.close()
    
    if (choice === '1') {
      fixDatabaseUrl()
    } else if (choice === '2') {
      useDirectConnectionString()
    } else {
      console.log('❌ Choix invalide')
    }
  })
}

if (require.main === module) {
  main()
}