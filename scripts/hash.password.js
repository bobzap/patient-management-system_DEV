const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Mot de passe à hasher: ', async (password) => {
  try {
    const hashed = await bcrypt.hash(password, 12)
    console.log('\n✅ Mot de passe hashé:')
    console.log(hashed)
    console.log('\n📋 Copiez ce hash dans Supabase (colonne password)')
  } catch (error) {
    console.error('Erreur:', error)
  }
  rl.close()
})
