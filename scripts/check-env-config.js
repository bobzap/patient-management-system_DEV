// scripts/check-env-config.js
const fs = require('fs')
const path = require('path')

function checkEnvConfig() {
  console.log('🔍 Vérification de la configuration .env.local...\n')
  
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local introuvable')
    console.log('📝 Créez le fichier .env.local avec votre configuration Supabase')
    return
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('📄 Contenu de .env.local:')
  console.log('----------------------------------------')
  
  const lines = envContent.split('\n')
  let hasSupabaseUrl = false
  let hasNextAuthUrl = false
  let hasNextAuthSecret = false
  
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=')
      
      if (key?.trim() === 'DATABASE_URL') {
        console.log(`${index + 1}: DATABASE_URL=${value.substring(0, 50)}...`)
        
        if (value.includes('localhost')) {
          console.log('   ❌ PROBLÈME: Pointe vers localhost au lieu de Supabase')
        } else if (value.includes('supabase.co')) {
          console.log('   ✅ URL Supabase détectée')
          hasSupabaseUrl = true
        } else {
          console.log('   ⚠️ URL non reconnue')
        }
      } else if (key?.trim() === 'NEXTAUTH_URL') {
        console.log(`${index + 1}: NEXTAUTH_URL=${value}`)
        hasNextAuthUrl = true
      } else if (key?.trim() === 'NEXTAUTH_SECRET') {
        console.log(`${index + 1}: NEXTAUTH_SECRET=${value ? '[PRÉSENT]' : '[VIDE]'}`)
        hasNextAuthSecret = !!value
      } else {
        console.log(`${index + 1}: ${key}=${value ? '[PRÉSENT]' : '[VIDE]'}`)
      }
    }
  })
  
  console.log('----------------------------------------\n')
  
  // Diagnostic
  console.log('📊 Diagnostic:')
  console.log(`   DATABASE_URL Supabase: ${hasSupabaseUrl ? '✅' : '❌'}`)
  console.log(`   NEXTAUTH_URL: ${hasNextAuthUrl ? '✅' : '❌'}`)
  console.log(`   NEXTAUTH_SECRET: ${hasNextAuthSecret ? '✅' : '❌'}`)
  
  if (!hasSupabaseUrl) {
    console.log('\n🔧 ACTION REQUISE: Configurez votre DATABASE_URL Supabase')
    console.log('\n📝 Format correct pour Supabase:')
    console.log('DATABASE_URL="postgresql://postgres.XXXX:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"')
    console.log('\n📍 Pour trouver votre URL Supabase:')
    console.log('   1. Allez sur https://supabase.com/dashboard')
    console.log('   2. Sélectionnez votre projet')
    console.log('   3. Allez dans Settings > Database')
    console.log('   4. Copiez la "Connection string" en mode "URI"')
    console.log('   5. Remplacez [YOUR-PASSWORD] par votre vraie mot de passe')
  }
  
  if (!hasNextAuthUrl) {
    console.log('\n⚠️ NEXTAUTH_URL manquante, ajoutez:')
    console.log('NEXTAUTH_URL="http://localhost:3002"')
  }
  
  if (!hasNextAuthSecret) {
    console.log('\n⚠️ NEXTAUTH_SECRET manquante, ajoutez:')
    console.log('NEXTAUTH_SECRET="votre-secret-de-32-caracteres-minimum"')
    console.log('Générez un secret: openssl rand -base64 32')
  }
  
  return { hasSupabaseUrl, hasNextAuthUrl, hasNextAuthSecret }
}

function generateEnvTemplate() {
  console.log('\n📝 Template .env.local pour Supabase:')
  console.log('=====================================')
  console.log('# Configuration Supabase')
  console.log('DATABASE_URL="postgresql://postgres.XXXX:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"')
  console.log('')
  console.log('# Configuration NextAuth')
  console.log('NEXTAUTH_URL="http://localhost:3002"')
  console.log('NEXTAUTH_SECRET="votre-secret-de-32-caracteres-minimum"')
  console.log('')
  console.log('# Optionnel: Debug')
  console.log('NODE_ENV="development"')
  console.log('=====================================')
}

async function testSupabaseConnection(databaseUrl) {
  if (!databaseUrl || databaseUrl.includes('localhost')) {
    console.log('❌ Impossible de tester: DATABASE_URL invalide')
    return false
  }
  
  console.log('\n🔗 Test de connexion Supabase...')
  
  try {
    // Temporairement override la variable d'environnement
    process.env.DATABASE_URL = databaseUrl
    
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    console.log('✅ Connexion Supabase réussie')
    
    const userCount = await prisma.authUser.count()
    console.log(`📊 Nombre d'utilisateurs: ${userCount}`)
    
    await prisma.$disconnect()
    return true
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('🔧 Le mot de passe dans votre DATABASE_URL est incorrect')
    } else if (error.message.includes('could not connect to server')) {
      console.log('🔧 Vérifiez l\'URL et que votre projet Supabase est actif')
    }
    
    return false
  }
}

async function main() {
  const config = checkEnvConfig()
  
  if (!config?.hasSupabaseUrl) {
    generateEnvTemplate()
    console.log('\n🎯 Prochaines étapes:')
    console.log('   1. Mettez à jour votre .env.local avec l\'URL Supabase')
    console.log('   2. Relancez ce script pour tester')
    console.log('   3. Puis testez la connexion: node scripts/test-supabase-login.js')
    return
  }
  
  // Si on a une URL Supabase, on teste
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  const databaseUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='))
  
  if (databaseUrlLine) {
    const databaseUrl = databaseUrlLine.split('=')[1]?.replace(/^["']|["']$/g, '')
    await testSupabaseConnection(databaseUrl)
  }
}

if (require.main === module) {
  main().catch(console.error)
}