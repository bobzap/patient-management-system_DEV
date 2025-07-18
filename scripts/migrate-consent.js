// scripts/migrate-consent.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Préparation de la migration du consentement...');

// Lire le fichier .env pour récupérer DATABASE_URL
const envFile = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envFile)) {
  console.error('❌ Fichier .env non trouvé');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');
const databaseUrl = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));

if (!databaseUrl) {
  console.error('❌ DATABASE_URL non trouvée dans .env');
  process.exit(1);
}

// Créer un fichier .env temporaire avec DIRECT_URL
const tempEnvContent = envContent + '\nDIRECT_URL=' + databaseUrl.split('=')[1];
fs.writeFileSync(path.join(__dirname, '..', '.env.temp'), tempEnvContent);

console.log('✅ Fichier .env temporaire créé');

try {
  // Déplacer .env vers .env.backup
  fs.renameSync(envFile, path.join(__dirname, '..', '.env.backup'));
  
  // Utiliser .env.temp comme .env
  fs.renameSync(path.join(__dirname, '..', '.env.temp'), envFile);
  
  console.log('🚀 Exécution de la migration Prisma...');
  
  // Exécuter la migration
  execSync('npx prisma migrate dev --name add-consent-system', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') 
  });
  
  console.log('✅ Migration terminée avec succès');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
} finally {
  // Restaurer le fichier .env original
  if (fs.existsSync(path.join(__dirname, '..', '.env.backup'))) {
    fs.renameSync(path.join(__dirname, '..', '.env.backup'), envFile);
    console.log('✅ Fichier .env restauré');
  }
  
  // Nettoyer les fichiers temporaires
  const tempFiles = ['.env.temp', '.env.backup'];
  tempFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

console.log('🎉 Migration terminée !');