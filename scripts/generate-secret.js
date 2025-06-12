// scripts/generate-secret.js
// Générateur de secret sécurisé pour Windows

const crypto = require('crypto');

function generateSecret() {
  // Générer un secret de 32 bytes en base64
  const secret = crypto.randomBytes(32).toString('base64');
  
  console.log('🔐 Secret généré pour NEXTAUTH_SECRET:');
  console.log('');
  console.log('NEXTAUTH_SECRET="' + secret + '"');
  console.log('');
  console.log('📋 Copiez cette ligne dans votre fichier .env.local');
  console.log('⚠️  Gardez ce secret secret et ne le partagez jamais !');
  
  return secret;
}

// Exécution si lancé directement
if (require.main === module) {
  generateSecret();
}

module.exports = { generateSecret };