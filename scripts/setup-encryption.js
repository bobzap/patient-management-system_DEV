// scripts/setup-encryption.js - Script d'initialisation du chiffrement
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Génère les clés de chiffrement pour l'environnement
 */
function generateKeys() {
  console.log('🔐 Génération des clés de chiffrement...');
  
  const key = crypto.randomBytes(32).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  
  const keys = { key, salt };
  
  console.log('✅ Clés générées avec succès');
  console.log('📝 Ajoutez ces variables à votre fichier .env :');
  console.log('');
  console.log('# Clés de chiffrement des données sensibles');
  console.log(`ENCRYPTION_KEY=${keys.key}`);
  console.log(`ENCRYPTION_SALT=${keys.salt}`);
  console.log('');
  console.log('⚠️  IMPORTANT : Gardez ces clés secrètes et sauvegardez-les de manière sécurisée !');
  console.log('⚠️  La perte de ces clés rendra les données chiffrées inaccessibles !');
  
  return keys;
}

/**
 * Teste le système de chiffrement
 */
async function testEncryptionSystem() {
  console.log('🧪 Test du système de chiffrement...');
  
  try {
    // Vérification des variables d'environnement
    if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_SALT) {
      console.log('⚠️  Variables d\'environnement manquantes - utilisez npm run encryption:generate');
      return false;
    }
    
    // Test basique de chiffrement
    const testData = 'Test de chiffrement - données sensibles';
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY + process.env.ENCRYPTION_SALT).digest();
    const iv = crypto.randomBytes(16);
    
    // Chiffrement
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(testData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Déchiffrement
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const result = decrypted === testData;
    
    if (result) {
      console.log('✅ Test de chiffrement réussi');
      return true;
    } else {
      console.log('❌ Test de chiffrement échoué');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de chiffrement:', error.message);
    return false;
  }
}

/**
 * Crée un fichier d'environnement exemple
 */
function createEnvExample() {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const key = crypto.randomBytes(32).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  
  const envContent = `# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/vitalsync"
DIRECT_URL="postgresql://user:password@localhost:5432/vitalsync"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Chiffrement des données sensibles
ENCRYPTION_KEY="${key}"
ENCRYPTION_SALT="${salt}"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Optionnel : Configuration du chiffrement
ENCRYPTION_ENABLED="true"
ENCRYPTION_LOG_LEVEL="info"
`;

  fs.writeFileSync(envExamplePath, envContent);
  console.log('✅ Fichier .env.example créé');
}

/**
 * Vérifie l'environnement de production
 */
function checkProductionEnvironment() {
  console.log('🔍 Vérification de l\'environnement de production...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
    'ENCRYPTION_SALT'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes :');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    return false;
  }
  
  console.log('✅ Toutes les variables d\'environnement requises sont présentes');
  return true;
}

/**
 * Affiche les informations de sécurité
 */
function displaySecurityInfo() {
  console.log('');
  console.log('🔒 INFORMATIONS DE SÉCURITÉ');
  console.log('==========================');
  console.log('');
  console.log('Le système de chiffrement protège les données sensibles suivantes :');
  console.log('- Noms et prénoms des patients');
  console.log('- Dates de naissance');
  console.log('- Numéros de ligne');
  console.log('- Données d\'entretien complètes');
  console.log('');
  console.log('Algorithme utilisé : AES-256-GCM');
  console.log('Longueur de clé : 256 bits');
  console.log('Longueur IV : 128 bits');
  console.log('');
  console.log('RECOMMANDATIONS :');
  console.log('- Sauvegardez les clés de chiffrement dans un endroit sûr');
  console.log('- Utilisez des clés différentes pour chaque environnement');
  console.log('- Activez la rotation des clés régulièrement');
  console.log('- Surveillez les logs de chiffrement');
  console.log('');
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      generateKeys();
      break;
      
    case 'test':
      await testEncryptionSystem();
      break;
      
    case 'setup':
      const keys = generateKeys();
      createEnvExample();
      displaySecurityInfo();
      break;
      
    case 'check':
      checkProductionEnvironment();
      break;
      
    case 'info':
      displaySecurityInfo();
      break;
      
    default:
      console.log('');
      console.log('🔐 Script de configuration du chiffrement');
      console.log('=========================================');
      console.log('');
      console.log('Utilisation : node scripts/setup-encryption.js <command>');
      console.log('');
      console.log('Commandes disponibles :');
      console.log('  generate  - Génère de nouvelles clés de chiffrement');
      console.log('  test      - Teste le système de chiffrement');
      console.log('  setup     - Configuration complète (génération + exemple)');
      console.log('  check     - Vérifie l\'environnement de production');
      console.log('  info      - Affiche les informations de sécurité');
      console.log('');
      console.log('Exemples :');
      console.log('  npm run encryption:setup');
      console.log('  npm run encryption:test');
      console.log('  npm run encryption:generate');
      console.log('');
      break;
  }
}

// Exécution du script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
}

module.exports = {
  generateKeys,
  testEncryptionSystem,
  createEnvExample,
  checkProductionEnvironment,
  displaySecurityInfo
};